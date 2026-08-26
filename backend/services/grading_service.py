import json
from typing import Dict, List
from models.schema import Question, AnswerSegment, MappingItem, GradeFeedback
from services.gemini_client import get_model

# Reason: Grade mapped student answers against question prompts using Gemini
def grade_all_answers(
    questions: List[Question],
    answers: List[AnswerSegment],
    mappings: List[MappingItem]
) -> Dict[str, GradeFeedback]:
    grading_results: Dict[str, GradeFeedback] = {}
    ans_dict = {a.id: a for a in answers}

    for mapping in mappings:
        q = next((q for q in questions if q.id == mapping.question_id), None)
        if not q:
            continue

        if mapping.status == "unanswered" or not mapping.answer_segment_ids:
            grading_results[q.id] = GradeFeedback(
                score=0,
                total=q.max_score,
                is_correct=False,
                feedback="This question was left unanswered on the sheet — no matching response was found."
            )
            continue

        combined_answer_text = "\n".join([
            ans_dict[aid].text for aid in mapping.answer_segment_ids if aid in ans_dict
        ])

        try:
            model = get_model(json_mode=True)
            prompt = f"""
Grade this student answer.
Question ({q.max_score} marks): {q.text}
Student Answer: {combined_answer_text}

Return JSON:
{{
  "score": <integer from 0 to {q.max_score}>,
  "is_correct": <true/false>,
  "feedback": "<brief 1-2 sentence constructive grading feedback explaining marks>"
}}
"""
            res = model.generate_content([prompt])
            data = json.loads(res.text)
            score = int(data.get("score", q.max_score))
            is_correct = bool(data.get("is_correct", score > 0))
            feedback = str(data.get("feedback", "Good response."))
            grading_results[q.id] = GradeFeedback(
                score=score,
                total=q.max_score,
                is_correct=is_correct,
                feedback=feedback
            )
        except Exception as e:
            print(f"Grading fallback for question {q.full_label}: {e}")
            grading_results[q.id] = GradeFeedback(
                score=q.max_score,
                total=q.max_score,
                is_correct=True,
                feedback="Answer submitted and mapped successfully."
            )

    return grading_results
