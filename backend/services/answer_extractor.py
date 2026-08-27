import re
import json
import uuid
from typing import List
from PIL import Image
from models.schema import AnswerSegment, BBox
from services.gemini_client import get_model

ANSWER_PROMPT = """
You are an expert handwritten exam grader. Analyze this handwritten answer sheet page.
Extract every distinct answer segment/block written by the student.

Rules:
1. Extract the written question label if present (e.g. "Q1", "Ans 2", "3(a)", "4.", or null if no label was written).
2. Extract the complete handwritten text for that answer block.
3. Provide approximate bounding box for this answer block in normalized coordinates (0.0 to 1.0 relative to page width/height):
   {"x": 0.05, "y": 0.1, "w": 0.9, "h": 0.25}

Return a JSON array:
[
  {
    "label": "Q1",
    "text": "...",
    "bbox": {"x": 0.05, "y": 0.08, "w": 0.9, "h": 0.2}
  }
]
"""

FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]

# Reason: Parse JSON string with markdown backtick stripping
def clean_json_parse(text: str):
    clean = re.sub(r'```(?:json)?', '', text).strip()
    return json.loads(clean)

# Reason: Extract raw answer segments with Gemini vision
def extract_answers_from_page(page_img: Image.Image, page_num: int, start_order: int) -> List[AnswerSegment]:
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
                    order=start_order + idx
                )
                segments.append(seg)
            if segments:
                return segments
        except Exception as e:
            print(f"[ANS PAGE {page_num}] Model {model_name} failed: {e}")

    return []

# Reason: Extract answer segments across all student answer pages
def extract_all_answers(pages: List[Image.Image]) -> List[AnswerSegment]:
    all_segments = []
    order = 1
    for page_idx, page_img in enumerate(pages):
        page_num = page_idx + 1
        page_segs = extract_answers_from_page(page_img, page_num=page_num, start_order=order)
        all_segments.extend(page_segs)
        order += len(page_segs)
    return all_segments
