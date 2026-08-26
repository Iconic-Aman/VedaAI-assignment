# Implementation Plan — AI Assessment Extraction & Answer Mapping (FastAPI)

> Backend-focused. Each phase lists the topics/tools involved and what "done" looks like, mapped back to what's actually graded.

---

## Phase 0 — Project Setup

- `pip install fastapi uvicorn python-multipart pymupdf pytesseract rapidfuzz google-generativeai pydantic`
- Install the **Tesseract OCR binary** at the OS level (`apt-get install tesseract-ocr` locally, or in the Dockerfile for deployment) — `pytesseract` is only a wrapper, it calls out to this binary.
- Get a **Google AI Studio** API key (Gemini 2.0/2.5 Flash — free tier), set as `GEMINI_API_KEY` in `.env`.
- Scaffold `main.py` with a FastAPI app instance and router includes.

**Topics involved:** ASGI app setup, system-level dependency installation, environment config, SDK auth.

---

## Phase 1 — Upload & Preprocessing

**Goal:** Both files land as normalized page images, ready for extraction.

- [ ] `POST /upload` — accept question paper + answer sheet (`UploadFile`), generate a `session_id` (`uuid4`), store raw files in a temp dir.
- [ ] If PDF → rasterize each page to PNG using **PyMuPDF** at a **fixed DPI** (e.g. 150–200). This matters: bounding boxes only mean anything in pixel space, and DPI must stay consistent or highlight coordinates drift page to page.
- [ ] If image(s) uploaded directly → skip rasterization, just normalize orientation/size.
- [ ] Return upload progress via a simple `GET /session/{id}/status` polling endpoint — no need for websockets for this scope.

**Topics/tools:** `PyMuPDF` (`fitz`), `UploadFile` handling, temp file storage.

**Eval link:** not scored directly, but a DPI mismatch here silently breaks "correct highlighting" later — get this right first.

---

## Phase 2 — Question Extraction

**Goal:** Every question, in printed order, sub-parts separated, numbering preserved exactly.

- [ ] Send each question-paper page image to Gemini with a **strict JSON-mode prompt**:
  - Extract every question and labelled sub-part as a separate entry.
  - Preserve the exact numbering string as printed (`"11"`, `"11(a)"` — don't normalize or renumber).
  - Return `{number, sub_part, text, order}` per entry, in the order they appear on the page.
- [ ] Parse the model's JSON response into `Question` Pydantic models — validation here catches malformed LLM output immediately instead of silently propagating it.
- [ ] Concatenate across pages, re-index a global `order` field.
- [ ] Sanity-check: no duplicate `(number, sub_part)` pairs; if found, keep first occurrence and log a warning rather than silently merging.

**Topics/tools:** Gemini vision + JSON schema prompting, Pydantic validation, prompt engineering for numbering fidelity.

**Eval link:** directly scored — "accuracy of question extraction," including the explicit sub-part requirement.

---

## Phase 3 — Answer Extraction

**Goal:** Every handwritten answer segment extracted with text + an accurate region.

- [ ] Send each answer-sheet page image to Gemini: extract the student's written label (if any — "Q3", "3.", "Ans 3") and the answer text, per contiguous block.
- [ ] **Separately**, run the same page through `pytesseract` to get word/line-level bounding boxes — LLMs read handwriting reasonably well but are unreliable at pixel-precise coordinates.
- [ ] Align the two: fuzzy-match (`rapidfuzz`) the LLM's extracted answer text against OCR line text to find which OCR bounding boxes correspond to that answer block. Merge adjacent OCR line-boxes (min/max of x/y/w/h) into one bounding region per answer segment.
- [ ] Store `{label, text, page, bbox, order}` per segment as an `AnswerSegment` model.

**Topics/tools:** Gemini vision, `pytesseract`, `rapidfuzz` text alignment, bounding-box merging logic.

**Eval link:** core of two eval params — "accuracy of answer mapping" (needs clean text+label) and "correct highlighting" (needs the bbox alignment step, not just LLM-guessed coordinates).

---

## Phase 4 — Answer → Question Mapping

**Goal:** Every answer segment linked to the right question, regardless of order; unanswered and unmatched cases surfaced explicitly.

- [ ] **Pass 1 — regex label match:** parse student labels like `Q3`, `3.`, `3(a)`, `Ans-3` against question numbers/sub-parts using Python `re`. Direct match wins immediately.
- [ ] **Pass 2 — fuzzy match:** for labels that are close but not exact (OCR noise, e.g. "Q3" misread as "03"), use `rapidfuzz.fuzz` scoring against known question numbers, with a similarity threshold.
- [ ] **Pass 3 — LLM semantic fallback:** for answer segments with *no* label at all, send the question list + the unlabeled answer text to Gemini and ask which question (if any) it most likely answers, with an explicit "no match" option in the response schema.
- [ ] **Multi-page merge:** if consecutive answer segments across pages resolve to the same question with no other question's label in between, merge into one logical answer (`answer_segment_ids` list grows).
- [ ] **Resolve final status per question:** `answered` / `unanswered` (no segment matched) — and separately track `unmatched_extra` (answer segments that matched nothing, kept, never dropped).

**Topics/tools:** Python `re`, `rapidfuzz`, one lightweight LLM call for the semantic fallback pass only (keeps cost/latency down vs. running LLM matching for everything).

**Eval link:** the other core scored item — "accuracy of answer mapping" and "handling of edge cases" (out-of-order, unanswered, unmatched, multi-page) all live here.

---

## Phase 5 — Grading & Feedback (Optional Scope)

**Goal:** Add value on top of a correct mapping, without it becoming the main event.

- [ ] For each `answered` question: one Gemini call with `{question_text, answer_text}` → `{is_correct, score, feedback}`.
- [ ] For `unanswered` questions: skip grading, mark as zero/no submission.
- [ ] Aggregate into an overall summary: total score, count answered/unanswered/unmatched.

**Topics/tools:** structured LLM grading prompts, simple aggregation logic.

**Eval link:** explicitly listed as in-scope-but-optional — build this only after Phases 1–4 are solid, since grading accuracy isn't the primary eval target but mapping accuracy is.

---

## Phase 6 — API Layer & In-Memory Storage

- [ ] `POST /upload` → returns `session_id`.
- [ ] `POST /process/{session_id}` → runs Phases 1–5 (use `async def` routes so the Gemini calls for question/answer extraction can run concurrently via `asyncio.gather`), stores result in an in-memory `dict`.
- [ ] `GET /session/{session_id}` → returns `{questions, answer_segments, mapping, unmatched_extra, grading}` for the frontend to render side-by-side + highlight.
- [ ] Background task (FastAPI `BackgroundTasks` or a simple periodic check) clears sessions older than, say, 1 hour, since there's no DB.
- [ ] Run Uvicorn with **`--workers 1`** — this is required, not optional, because the store is an in-process `dict`; more workers means sessions randomly "disappear" depending on which worker handles the request.

**Topics/tools:** FastAPI routing, `asyncio.gather` for concurrent LLM calls, `BackgroundTasks`, basic error handling (bad file type, extraction failure, Gemini rate limit → return a clear HTTP error, don't crash the session).

---

## Phase 7 — Deployment

- [ ] Write a `Dockerfile` that installs `tesseract-ocr` via `apt-get` before installing Python deps — this step is the one most likely to be forgotten and cause a silent OCR failure in production.
- [ ] Deploy to **Render** or **Railway** (both support Dockerfile-based deploys; Vercel's Python runtime does not support installing system packages like Tesseract).
- [ ] Set `GEMINI_API_KEY` as an environment variable on the platform.
- [ ] Confirm the live URL handles a full upload → process → fetch cycle end-to-end before submitting.

---

## Priority Order If Time-Constrained

Given what's actually scored, if you have to cut scope, cut in this order (last item first):

1. Grading/feedback (explicitly optional)
2. Multi-page answer merging (edge case, but a smaller slice of "edge case handling")
3. LLM semantic fallback pass for unlabeled answers (fall back to just marking these `unmatched_extra` if you run out of time)
4. **Never cut:** question extraction fidelity, label-based mapping, and bounding-box alignment — these three are what "accuracy of question extraction," "accuracy of answer mapping," and "correct highlighting" directly measure.

---

## AI Model / API Summary

| Use | Model | Free tier? |
|---|---|---|
| Question extraction (vision + JSON) | Gemini 2.0 Flash or 2.5 Flash | Yes, via Google AI Studio |
| Answer extraction (vision + JSON) | Gemini 2.0 Flash or 2.5 Flash | Yes |
| Semantic mapping fallback | Gemini 2.0 Flash (text-only call) | Yes |
| Grading (optional) | Gemini 2.0 Flash | Yes |
| Precise bounding boxes | `pytesseract` (local, no API cost) | Yes, fully local |
