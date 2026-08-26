import json
import uuid
from typing import List
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

# Reason: Extract questions from a single page image via Gemini vision
def extract_questions_from_page(page_img: Image.Image, page_num: int, start_order: int) -> List[Question]:
    try:
        model = get_model(json_mode=True)
        response = model.generate_content([QUESTION_PROMPT, page_img])
        raw_data = json.loads(response.text)
        if isinstance(raw_data, dict) and "questions" in raw_data:
            raw_data = raw_data["questions"]
        if not isinstance(raw_data, list):
            raw_data = []

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
                order=start_order + idx,
                max_score=max_score
            )
            questions.append(q)
        return questions
    except Exception as e:
        print(f"Error extracting questions on page {page_num}: {e}")
        return []

# Reason: Extract questions across all question paper pages in order
def extract_all_questions(pages: List[Image.Image]) -> List[Question]:
    all_questions = []
    order = 1
    for page_idx, page_img in enumerate(pages):
        page_num = page_idx + 1
        page_qs = extract_questions_from_page(page_img, page_num=page_num, start_order=order)
        all_questions.extend(page_qs)
        order += len(page_qs)
    return all_questions
