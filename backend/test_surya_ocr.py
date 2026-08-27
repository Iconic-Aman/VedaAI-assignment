import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont
from services.pdf_service import process_upload_to_images

# Reason: Test Surya OCR line detection, answer grouping, and generate visual annotated image
def run_surya_test(pdf_path: str = "answer2.pdf"):
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.")
        return

    print("=" * 60)
    print(f"TESTING SURYA OCR & BOUNDING BOX DETECTION ON: {pdf_path}")
    print("=" * 60)

    # 1. Load and rasterize PDF
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    page_images = process_upload_to_images(pdf_bytes, pdf_path)
    print(f"\n1. Rasterized {len(page_images)} page(s) from {pdf_path}.")

    # 2. Check if surya is installed
    try:
        from surya.recognition import RecognitionPredictor
        from surya.detection import DetectionPredictor
        from surya.foundation import DetectionModel, RecognitionModel
        print("\n2. Loading Surya OCR detection and recognition models...")
        det_model = DetectionModel()
        rec_model = RecognitionModel()
        det_predictor = DetectionPredictor(det_model)
        rec_predictor = RecognitionPredictor(rec_model)
        has_surya = True
    except ImportError as e:
        print(f"\n[Notice] Surya OCR not installed yet: {e}")
        print("Install via: pip install surya-ocr torch torchvision")
        print("\nFalling back to PIL/Gemini spatial visualizer test...")
        has_surya = False

    # 3. Process each page
    for page_idx, page_img in enumerate(page_images):
        page_num = page_idx + 1
        img_w, img_h = page_img.size
        print(f"\n--- Processing Page {page_num} ({img_w}x{img_h} px) ---")

        annotated_img = page_img.copy().convert("RGB")
        draw = ImageDraw.Draw(annotated_img)

        detected_lines = []

        if has_surya:
            # Run Surya line detection & OCR
            det_results = det_predictor([page_img])[0]
            rec_results = rec_predictor([page_img], det_results.bboxes)[0]

            for rec_line in rec_results.text_lines:
                bbox = rec_line.bbox  # [x1, y1, x2, y2]
                text = rec_line.text
                detected_lines.append({
                    "text": text,
                    "bbox": [bbox[0], bbox[1], bbox[2], bbox[3]], # x1, y1, x2, y2
                    "norm_bbox": {
                        "x": bbox[0] / img_w,
                        "y": bbox[1] / img_h,
                        "w": (bbox[2] - bbox[0]) / img_w,
                        "h": (bbox[3] - bbox[1]) / img_h
                    }
                })
        else:
            # Use spatial Gemini 2D grounding as preview
            from services.answer_extractor import extract_answers_from_page
            segments = extract_answers_from_page(page_img, page_num)
            for seg in segments:
                b = seg.bbox
                x1 = int(b.x * img_w)
                y1 = int(b.y * img_h)
                x2 = int((b.x + b.w) * img_w)
                y2 = int((b.y + b.h) * img_h)
                detected_lines.append({
                    "label": seg.label,
                    "text": seg.text,
                    "bbox": [x1, y1, x2, y2],
                    "norm_bbox": {"x": b.x, "y": b.y, "w": b.w, "h": b.h}
                })

        print(f"Found {len(detected_lines)} detected segments/lines on Page {page_num}:")
        for idx, item in enumerate(detected_lines):
            x1, y1, x2, y2 = item["bbox"]
            lbl = item.get("label", f"Line {idx+1}")
            txt = item["text"][:80]
            print(f"  [{lbl}] Box: ({x1}, {y1}) -> ({x2}, {y2}) | Text: {txt}")

            # Draw green bounding box rectangle
            draw.rectangle([x1, y1, x2, y2], outline="#16a34a", width=3)
            # Draw label tag box
            draw.rectangle([x1, max(0, y1 - 22), x1 + 80, y1], fill="#16a34a")
            draw.text((x1 + 6, max(0, y1 - 20)), str(lbl), fill="#ffffff")

        # Save visual output image
        out_img_name = f"annotated_answer_page_{page_num}.png"
        annotated_img.save(out_img_name)
        print(f"\n[Saved Image] Visual bounding box overlay saved to: {out_img_name}")

        # Save JSON output
        out_json_name = f"surya_extracted_page_{page_num}.json"
        with open(out_json_name, "w") as out:
            json.dump(detected_lines, out, indent=2)
        print(f"[Saved JSON] Data saved to: {out_json_name}")

    print("\n" + "=" * 60)
    print("SURYA TEST COMPLETED. Open the saved .png images to see exact boxes!")
    print("=" * 60)

if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else "answer2.pdf"
    run_surya_test(pdf)
