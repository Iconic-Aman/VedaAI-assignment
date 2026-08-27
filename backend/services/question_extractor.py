import re
import json
import uuid
from typing import List
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from models.schema import Question
from services.gemini_client import get_model

QUESTION_PROMPT = """
You are an expert exam analyzer. Extract all questions from this question paper page in the exact printed order.

Rules:
1. Treat labelled sub-parts as separate questions (e.g., '11 (a)' and '11 (b)' must be distinct entries).
2. Preserve original printed numbering as string (e.g. "1", "2(a)", "11(b)").
3. For each question, provide:
   - "number": main question number (e.g., "11")
   - "sub_part": sub-part identifier if any (e.g., "a", "b", or null)
   - "full_label": complete label (e.g., "11(a)")
   - "text": full text of question including prompt instructions
   - "max_score": marks/points for this question (integer, default 5 if not specified)

Return a JSON array of question objects:
[
  {"number": "1", "sub_part": null, "full_label": "1", "text": "...", "max_score": 2}
]
"""

FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]

# Reason: Parse JSON string with markdown backtick stripping
def clean_json_parse(text: str):
    clean = re.sub(r'```(?:json)?', '', text).strip()
    return json.loads(clean)

# Reason: Extract questions from a single page image via Gemini vision with automatic fallback
def extract_questions_from_page(page_img: Image.Image, page_num: int) -> List[Question]:
    for model_name in FALLBACK_MODELS:
        try:
            model = get_model(model_name=model_name, json_mode=True)
            response = model.generate_content([QUESTION_PROMPT, page_img])
            raw_data = clean_json_parse(response.text)
            if isinstance(raw_data, dict) and "questions" in raw_data:
                raw_data = raw_data["questions"]
            if not isinstance(raw_data, list):
                continue

            questions = []
            for idx, item in enumerate(raw_data):
                q_num = str(item.get("number", idx + 1))
                sub = item.get("sub_part")
                sub_str = str(sub) if sub else None
                full_label = str(item.get("full_label", f"{q_num}({sub_str})" if sub_str else q_num))
                text = str(item.get("text", "")).strip()
                max_score = int(item.get("max_score", 5))

                q = Question(
                    id=str(uuid.uuid4()),
                    number=q_num,
                    sub_part=sub_str,
                    full_label=full_label,
                    text=text,
                    page=page_num,
                    order=idx + 1,
                    max_score=max_score
                )
                questions.append(q)

            if questions:
                return questions
        except Exception as e:
            print(f"[PAGE {page_num}] Model {model_name} failed: {e}")

    return []

# Reason: Extract questions across all question paper pages concurrently in order
def extract_all_questions(pages: List[Image.Image]) -> List[Question]:
    if not pages:
        return []

    with ThreadPoolExecutor(max_workers=min(len(pages), 5)) as executor:
        futures = [
            executor.submit(extract_questions_from_page, page_img, idx + 1)
            for idx, page_img in enumerate(pages)
        ]
        page_results = [f.result() for f in futures]

    all_questions = []
    order = 1
    for page_qs in page_results:
        for q in page_qs:
            q.order = order
            order += 1
            all_questions.append(q)

    return all_questions
