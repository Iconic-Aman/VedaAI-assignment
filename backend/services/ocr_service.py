import os
from PIL import Image
from typing import List, Dict, Any
from models.schema import AnswerSegment, BBox

try:
    import pytesseract
    from rapidfuzz import fuzz
    HAS_OCR = True
    tess_cmd = os.getenv("TESSERACT_CMD")
    if tess_cmd:
        pytesseract.pytesseract.tesseract_cmd = tess_cmd
except ImportError:
    HAS_OCR = False

# Reason: Extract line-level bounding boxes via Tesseract OCR if installed
def get_ocr_lines(img: Image.Image) -> List[Dict[str, Any]]:
    if not HAS_OCR:
        return []
    try:
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        lines = []
        n_boxes = len(data.get('text', []))
        img_w, img_h = img.size

        for i in range(n_boxes):
            text = str(data['text'][i]).strip()
            if not text:
                continue
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            lines.append({
                "text": text,
                "bbox": {
                    "x": x / img_w,
                    "y": y / img_h,
                    "w": w / img_w,
                    "h": h / img_h
                }
            })
        return lines
    except Exception as e:
        print(f"Tesseract OCR fallback: {e}")
        return []

# Reason: Refine answer segment bounding boxes with OCR tokens or keep Gemini coordinates
def refine_answer_bboxes(segments: List[AnswerSegment], page_images: List[Image.Image]) -> List[AnswerSegment]:
    if not HAS_OCR:
        return segments

    refined = []
    for seg in segments:
        page_idx = seg.page - 1
        if page_idx < 0 or page_idx >= len(page_images):
            refined.append(seg)
            continue

        img = page_images[page_idx]
        ocr_lines = get_ocr_lines(img)
        if not ocr_lines:
            refined.append(seg)
            continue

        matched_boxes = []
        seg_words = seg.text.lower().split()
        for item in ocr_lines:
            ocr_text = item["text"].lower()
            if any(fuzz.ratio(ocr_text, w) > 80 for w in seg_words):
                matched_boxes.append(item["bbox"])

        if matched_boxes:
            min_x = min(b["x"] for b in matched_boxes)
            min_y = min(b["y"] for b in matched_boxes)
            max_x = max(b["x"] + b["w"] for b in matched_boxes)
            max_y = max(b["y"] + b["h"] for b in matched_boxes)
            pad = 0.02
            refined_bbox = BBox(
                x=max(0.0, min_x - pad),
                y=max(0.0, min_y - pad),
                w=min(1.0 - min_x + pad, max_x - min_x + 2 * pad),
                h=min(1.0 - min_y + pad, max_y - min_y + 2 * pad)
            )
            seg.bbox = refined_bbox
        refined.append(seg)
    return refined
