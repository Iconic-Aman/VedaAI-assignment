import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()

from services.pdf_service import process_upload_to_images
from services.answer_extractor import extract_all_answers
from services.ocr_service import refine_answer_bboxes

# Reason: Standalone test script to verify student answer sheet extraction end-to-end
def test_answer_extraction(pdf_path: str = "answer2.pdf"):
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in backend/.env")
        return

    print("=" * 60)
    print(f"TESTING HANDWRITTEN ANSWER EXTRACTION: {pdf_path}")
    print("=" * 60)

    print(f"\n1. Reading answer sheet PDF: {pdf_path}")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print("2. Rasterizing answer pages at fixed DPI...")
    page_images = process_upload_to_images(pdf_bytes, pdf_path)
    print(f"   Generated {len(page_images)} page image(s).")

    print("\n3. Sending pages to Gemini Vision for answer extraction...")
    answers = extract_all_answers(page_images)
    print(f"   Extracted {len(answers)} raw answer segment(s).")

    print("\n4. Refining bounding boxes...")
    refined_answers = refine_answer_bboxes(answers, page_images)

    print(f"\n--- Extracted {len(refined_answers)} Answer Segment(s) ---")
    for idx, ans in enumerate(refined_answers):
        b = ans.bbox
        print(f"[Segment {idx+1}] Label: {ans.label or '(unlabeled)'} | Page {ans.page} | Order {ans.order}")
        print(f"   BBox: x={b.x:.3f}, y={b.y:.3f}, w={b.w:.3f}, h={b.h:.3f}")
        print(f"   Text: {ans.text[:120]}...")
        print()

    out_file = "extracted_answers_test.json"
    with open(out_file, "w") as out:
        json.dump([a.model_dump() for a in refined_answers], out, indent=2)
    print(f"Results saved to {out_file}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "answer2.pdf"
    test_answer_extraction(target)
