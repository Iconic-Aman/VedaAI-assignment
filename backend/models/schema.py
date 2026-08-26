from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

# Reason: Normalized bounding box coordinates (0.0 to 1.0 relative to page image)
class BBox(BaseModel):
    x: float
    y: float
    w: float
    h: float

# Reason: Extracted question entity with sub-part handling
class Question(BaseModel):
    id: str
    number: str
    sub_part: Optional[str] = None
    full_label: str
    text: str
    page: int
    order: int
    max_score: int = Field(default=5)

# Reason: Extracted student handwritten answer segment
class AnswerSegment(BaseModel):
    id: str
    label: Optional[str] = None
    text: str
    page: int
    bbox: BBox
    order: int

# Reason: Mapping relationship between questions and student answers
class MappingItem(BaseModel):
    question_id: str
    answer_segment_ids: List[str] = Field(default_factory=list)
    match_type: Literal["label", "fuzzy", "llm_semantic", "none"]
    status: Literal["answered", "unanswered"]

# Reason: AI Grading score and pedagogical feedback
class GradeFeedback(BaseModel):
    score: int
    total: int
    is_correct: bool
    feedback: str

# Reason: Full session state returned to client
class SessionData(BaseModel):
    session_id: str
    status: Literal["uploaded", "processing", "completed", "failed"]
    error: Optional[str] = None
    question_pages: List[str] = Field(default_factory=list)
    answer_pages: List[str] = Field(default_factory=list)
    questions: List[Question] = Field(default_factory=list)
    answer_segments: List[AnswerSegment] = Field(default_factory=list)
    mappings: List[MappingItem] = Field(default_factory=list)
    unmatched_answers: List[AnswerSegment] = Field(default_factory=list)
    grading: Dict[str, GradeFeedback] = Field(default_factory=dict)
