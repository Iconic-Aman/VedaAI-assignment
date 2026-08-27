import re
import json
import uuid
from typing import List
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from models.schema import AnswerSegment, BBox
from services.gemini_client import get_model

# Reason: Generic, domain-agnostic prompt for handwritten answer segment extraction and spatial grounding
ANSWER_PROMPT = """
You are an expert handwritten exam analyzer and spatial document layout extractor.
Scan the entire handwritten answer sheet page from top to bottom.
Extract EVERY distinct handwritten answer block or response written by the student.

Guidelines:
1. Detect all question markers or answer identifiers on the page (e.g., circled numbers, margin indicators, prefixes like Q1, Ans 2, (a), (b)).
2. For every distinct answer, determine the precise 2D bounding box covering the question marker and the entire handwritten text for that response.
3. Transcribe the complete handwritten text for each answer block.

Return a JSON array of all detected answers on the page:
[
  {
    "label": "1",
    "box_2d": [100, 80, 250, 920],
    "text": "Transcribed handwritten answer text..."
  }
]
"""

FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]

# Reason: Parse JSON string with markdown backtick stripping
def clean_json_parse(text: str):
    clean = re.sub(r'```(?:json)?', '', text).strip()
    return json.loads(clean)

# Reason: Extract raw answer segments with accurate 2D coordinates
def extract_answers_from_page(page_img: Image.Image, page_num: int) -> List[AnswerSegment]:
    for model_name in FALLBACK_MODELS:
        try:
            model = get_model(model_name=model_name, json_mode=True)
            response = model.generate_content([ANSWER_PROMPT, page_img])
            raw_data = clean_json_parse(response.text)
            if isinstance(raw_data, dict) and "answers" in raw_data:
                raw_data = raw_data["answers"]
            if not isinstance(raw_data, list):
                continue

            segments = []
            for idx, item in enumerate(raw_data):
                label = item.get("label")
                label_str = str(label).strip() if label else None
                text = str(item.get("text", "")).strip()

                box_2d = item.get("box_2d")
                if isinstance(box_2d, list) and len(box_2d) == 4:
                    ymin, xmin, ymax, xmax = [float(v) for v in box_2d]
                    ymin, xmin = max(0.0, ymin), max(0.0, xmin)
                    ymax, xmax = min(1000.0, ymax), min(1000.0, xmax)
                    bbox = BBox(
                        x=round(xmin / 1000.0, 4),
                        y=round(ymin / 1000.0, 4),
                        w=round(max(0.01, (xmax - xmin) / 1000.0), 4),
                        h=round(max(0.01, (ymax - ymin) / 1000.0), 4)
                    )
                else:
                    bbox_dict = item.get("bbox", {})
                    bbox = BBox(
                        x=float(bbox_dict.get("x", 0.05)),
                        y=float(bbox_dict.get("y", 0.05)),
                        w=float(bbox_dict.get("w", 0.9)),
                        h=float(bbox_dict.get("h", 0.2))
                    )

                seg = AnswerSegment(
                    id=str(uuid.uuid4()),
                    label=label_str,
                    text=text,
                    page=page_num,
                    bbox=bbox,
                    order=idx + 1
                )
                segments.append(seg)
            if segments:
                return segments
        except Exception as e:
            print(f"[ANS PAGE {page_num}] Model {model_name} failed: {e}")

    return []

# Reason: Extract answer segments across all student answer pages in parallel
def extract_all_answers(pages: List[Image.Image]) -> List[AnswerSegment]:
    if not pages:
        return []

    with ThreadPoolExecutor(max_workers=min(len(pages), 5)) as executor:
        futures = [
            executor.submit(extract_answers_from_page, page_img, idx + 1)
            for idx, page_img in enumerate(pages)
        ]
        page_results = [f.result() for f in futures]

    all_segments = []
    order = 1
    for page_segs in page_results:
        for seg in page_segs:
            seg.order = order
            order += 1
            all_segments.append(seg)

    return all_segments
