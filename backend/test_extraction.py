import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()

from services.pdf_service import process_upload_to_images
from services.question_extractor import extract_all_questions

# Reason: Standalone test script to verify PDF question extraction end-to-end
def test_pdf_extraction(pdf_path: str):
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in backend/.env")
        return

    print(f"1. Reading PDF: {pdf_path}")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print("2. Rasterizing PDF pages at fixed DPI...")
    page_images = process_upload_to_images(pdf_bytes, pdf_path)
    print(f"   Generated {len(page_images)} page image(s).")

    print("3. Sending pages to Gemini Vision for question extraction...")
    questions = extract_all_questions(page_images)

    print(f"\n--- Extracted {len(questions)} Question(s) ---")
    for q in questions:
        print(f"[{q.full_label}] (Page {q.page}, Order {q.order}, Marks {q.max_score}):")
        print(f"   Text: {q.text}")
        if q.sub_part:
            print(f"   Sub-part: {q.sub_part}")
        print()

    # Output JSON summary
    out_file = "extracted_questions_test.json"
    with open(out_file, "w") as out:
        json.dump([q.model_dump() for q in questions], out, indent=2)
    print(f"Results saved to {out_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_extraction.py <path_to_pdf>")
    else:
        test_pdf_extraction(sys.argv[1])
