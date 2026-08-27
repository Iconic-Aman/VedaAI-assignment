import re
import json
from typing import List, Tuple, Dict, Set
from models.schema import Question, AnswerSegment, MappingItem
from services.gemini_client import get_model

try:
    from rapidfuzz import fuzz
    HAS_FUZZ = True
except ImportError:
    HAS_FUZZ = False

# Reason: Normalize label string (e.g., 'Q11(a)' -> '11a')
def normalize_label(label: str) -> str:
    if not label:
        return ""
    clean = re.sub(r'^(?:q|question|ans|answer)[\s\.\:\-_]*', '', label.strip(), flags=re.IGNORECASE)
    clean = re.sub(r'[\s\.\:\-_]', '', clean).lower()
    return clean

# Reason: 3-pass Answer to Question mapping resolver
def map_answers_to_questions(
    questions: List[Question],
    answers: List[AnswerSegment]
) -> Tuple[List[MappingItem], List[AnswerSegment]]:
    q_lookup = {}
    for q in questions:
        norm_key = normalize_label(q.full_label)
        q_lookup[norm_key] = q.id
        if q.sub_part:
            q_lookup[normalize_label(f"{q.number}{q.sub_part}")] = q.id
        else:
            q_lookup[normalize_label(q.number)] = q.id

    matched_seg_ids: Set[str] = set()
    q_to_segs: Dict[str, List[str]] = {q.id: [] for q in questions}
    q_match_type: Dict[str, str] = {q.id: "none" for q in questions}

    # Pass 1: Direct normalized string match
    for seg in answers:
        if not seg.label:
            continue
        n_lbl = normalize_label(seg.label)
        if n_lbl in q_lookup:
            qid = q_lookup[n_lbl]
            q_to_segs[qid].append(seg.id)
            matched_seg_ids.add(seg.id)
            q_match_type[qid] = "label"

    # Pass 2: Fuzzy match if library available
    if HAS_FUZZ:
        for seg in answers:
            if seg.id in matched_seg_ids or not seg.label:
                continue
            n_lbl = normalize_label(seg.label)
            best_score = 0
            best_qid = None
            for q_key, qid in q_lookup.items():
                score = fuzz.ratio(n_lbl, q_key)
                if score > 80 and score > best_score:
                    best_score = score
                    best_qid = qid
            if best_qid:
                q_to_segs[best_qid].append(seg.id)
                matched_seg_ids.add(seg.id)
                if q_match_type[best_qid] == "none":
                    q_match_type[best_qid] = "fuzzy"

    # Pass 3: LLM Semantic fallback for unlabeled segments
    unmatched_segs = [s for s in answers if s.id not in matched_seg_ids]
    if unmatched_segs and questions:
        try:
            model = get_model(json_mode=True)
            q_summary = [{"id": q.id, "label": q.full_label, "text": q.text[:100]} for q in questions]
            ans_summary = [{"id": s.id, "text": s.text[:120]} for s in unmatched_segs]
            prompt = f"Match each student answer to the most relevant question ID. Return JSON: {{\"matches\": [{{\"answer_id\": \"...\", \"question_id\": \"... or null\"}}]}}\nQuestions: {json.dumps(q_summary)}\nAnswers: {json.dumps(ans_summary)}"
            res = model.generate_content([prompt])
            res_data = json.loads(res.text).get("matches", [])
            for m in res_data:
                aid = m.get("answer_id")
                qid = m.get("question_id")
                if qid and qid in q_to_segs and aid in [s.id for s in unmatched_segs]:
                    q_to_segs[qid].append(aid)
                    matched_seg_ids.add(aid)
                    if q_match_type[qid] == "none":
                        q_match_type[qid] = "llm_semantic"
        except Exception as e:
            print(f"Semantic fallback matching note: {e}")

    # Build final mapping items
    mappings = []
    for q in questions:
        seg_ids = q_to_segs.get(q.id, [])
        is_answered = len(seg_ids) > 0
        m_type = q_match_type.get(q.id, "none") if is_answered else "none"
        mappings.append(MappingItem(
            question_id=q.id,
            answer_segment_ids=seg_ids,
            match_type=m_type,
            status="answered" if is_answered else "unanswered"
        ))

    # Keep unmatched extra answers
    unmatched_extra = [s for s in answers if s.id not in matched_seg_ids]
    return mappings, unmatched_extra
