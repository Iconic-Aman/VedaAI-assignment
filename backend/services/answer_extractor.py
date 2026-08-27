import re
import json
import uuid
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from models.schema import AnswerSegment, BBox
from services.gemini_client import get_model

# Lazy-loaded Surya predictors
_SURYA_DET_PREDICTOR = None
_SURYA_REC_PREDICTOR = None
_HAS_SURYA = None

def _init_surya():
    global _SURYA_DET_PREDICTOR, _SURYA_REC_PREDICTOR, _HAS_SURYA
    if _HAS_SURYA is not None:
        return _HAS_SURYA
    try:
        from surya.recognition import RecognitionPredictor
        from surya.detection import DetectionPredictor
        from surya.foundation import DetectionModel, RecognitionModel
        _SURYA_DET_PREDICTOR = DetectionPredictor(DetectionModel())
        _SURYA_REC_PREDICTOR = RecognitionPredictor(RecognitionModel())
        _HAS_SURYA = True
        print("[SURYA OCR] Models initialized successfully.")
    except Exception as e:
        print(f"[SURYA OCR] Initialization skipped ({e}). Falling back to Gemini.")
        _HAS_SURYA = False
    return _HAS_SURYA

# Reason: Detect question label from handwritten line text
def _extract_line_label(text: str) -> Optional[str]:
    clean = text.strip()
    circle_map = {'①':'1','②':'2','③':'3','④':'4','⑤':'5','⑥':'6','⑦':'7','⑧':'8','⑨':'9','⑩':'10'}
    for sym, num in circle_map.items():
        if clean.startswith(sym):
            return num
    m = re.match(r'^(?:q|ans|question|answer)?\s*[(\[]?\s*(\d{1,2}|[a-zA-Z])[\s.)\]:-]', clean, re.IGNORECASE)
    if m:
        return m.group(1)
    return None

# Reason: Group Surya OCR detected lines into coherent answer blocks
def _group_surya_lines_into_answers(lines, img_w: int, img_h: int, page_num: int) -> List[AnswerSegment]:
    if not lines:
        return []
    # Sort lines top-to-bottom
    sorted_lines = sorted(lines, key=lambda l: (l['bbox'][1], l['bbox'][0]))
    groups = []
    curr_group = None

    for line in sorted_lines:
        lbl = _extract_line_label(line['text'])
        if lbl or curr_group is None:
            if curr_group:
                groups.append(curr_group)
            curr_group = {'label': lbl, 'lines': [line]}
        else:
            curr_group['lines'].append(line)
    if curr_group:
        groups.append(curr_group)

    segments = []
    for idx, g in enumerate(groups):
        b_boxes = [l['bbox'] for l in g['lines']]
        min_x = max(0, min(b[0] for b in b_boxes) - 10)
        min_y = max(0, min(b[1] for b in b_boxes) - 8)
        max_x = min(img_w, max(b[2] for b in b_boxes) + 10)
        max_y = min(img_h, max(b[3] for b in b_boxes) + 8)
        text = "\n".join(l['text'] for l in g['lines']).strip()

        segments.append(AnswerSegment(
            id=str(uuid.uuid4()),
            label=g['label'],
            text=text,
            page=page_num,
            bbox=BBox(
                x=round(min_x / img_w, 4),
                y=round(min_y / img_h, 4),
                w=round((max_x - min_x) / img_w, 4),
                h=round((max_y - min_y) / img_h, 4)
            ),
            order=idx + 1
        ))
    return segments

# Reason: Extract answers using Surya OCR line detection with Gemini fallback
def extract_answers_from_page(page_img: Image.Image, page_num: int) -> List[AnswerSegment]:
    img_w, img_h = page_img.size
    if _init_surya():
        try:
            det_res = _SURYA_DET_PREDICTOR([page_img])[0]
            rec_res = _SURYA_REC_PREDICTOR([page_img], det_res.bboxes)[0]
            lines = [{'bbox': l.bbox, 'text': l.text} for l in rec_res.text_lines]
            segs = _group_surya_lines_into_answers(lines, img_w, img_h, page_num)
            if segs:
                return segs
        except Exception as e:
            print(f"[SURYA ERROR] Page {page_num}: {e}")

    # Fallback to Gemini 2D grounding
    for model_name in ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]:
        try:
            model = get_model(model_name=model_name, json_mode=True)
            res = model.generate_content(["Extract all student answers with label, text, and box_2d: [ymin, xmin, ymax, xmax]. Return JSON: [{\"label\":\"1\", \"box_2d\":[100,50,300,900], \"text\":\"...\"}]", page_img])
            data = json.loads(re.sub(r'```(?:json)?', '', res.text).strip())
            if isinstance(data, dict) and "answers" in data:
                data = data["answers"]
            if isinstance(data, list) and data:
                segs = []
                for i, item in enumerate(data):
                    b2d = item.get("box_2d", [100, 50, 300, 900])
                    segs.append(AnswerSegment(
                        id=str(uuid.uuid4()),
                        label=str(item.get("label")) if item.get("label") else None,
                        text=str(item.get("text", "")).strip(),
                        page=page_num,
                        bbox=BBox(x=round(b2d[1]/1000, 4), y=round(b2d[0]/1000, 4), w=round((b2d[3]-b2d[1])/1000, 4), h=round((b2d[2]-b2d[0])/1000, 4)),
                        order=i + 1
                    ))
                return segs
        except Exception:
            continue
    return []

# Reason: Extract answer segments across all student answer pages in parallel
def extract_all_answers(pages: List[Image.Image]) -> List[AnswerSegment]:
    if not pages:
        return []
    with ThreadPoolExecutor(max_workers=min(len(pages), 4)) as executor:
        page_results = [f.result() for f in [executor.submit(extract_answers_from_page, img, idx + 1) for idx, img in enumerate(pages)]]
    all_segments = []
    order = 1
    for page_segs in page_results:
        for seg in page_segs:
            seg.order = order
            order += 1
            all_segments.append(seg)
    return all_segments
