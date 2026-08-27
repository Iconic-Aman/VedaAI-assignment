import os
import sys
import tkinter as tk
from tkinter import filedialog, ttk
from PIL import Image, ImageTk, ImageDraw
from services.pdf_service import process_upload_to_images

# Reason: Simple interactive Python Tkinter GUI to visualize OCR bounding boxes on handwritten pages
class SuryaViewerApp:
    def __init__(self, root, default_file="answer2.pdf"):
        self.root = root
        self.root.title("VedaAI - OCR Bounding Box Inspector")
        self.root.geometry("1100x800")

        self.pdf_path = default_file if os.path.exists(default_file) else ""
        self.page_images = []
        self.page_idx = 0
        self.zoom = 1.0
        self.detected_boxes = {} # page_idx -> list of {bbox, text, label}

        self._build_ui()
        if self.pdf_path:
            self._load_file(self.pdf_path)

    def _build_ui(self):
        # Top toolbar
        toolbar = tk.Frame(self.root, bg="#1e1e24", pady=8, padx=12)
        toolbar.pack(side=tk.TOP, fill=tk.X)

        tk.Button(toolbar, text="Open PDF/Image", command=self._pick_file, bg="#3b82f6", fg="white", font=("Arial", 10, "bold"), padx=10).pack(side=tk.LEFT, padx=6)
        tk.Button(toolbar, text="Run Surya OCR", command=self._run_ocr, bg="#16a34a", fg="white", font=("Arial", 10, "bold"), padx=10).pack(side=tk.LEFT, padx=6)

        self.btn_prev = tk.Button(toolbar, text="< Prev", command=self._prev_page, state=tk.DISABLED, bg="#27272a", fg="white", padx=8)
        self.btn_prev.pack(side=tk.LEFT, padx=4)
        self.lbl_page = tk.Label(toolbar, text="Page 0 of 0", bg="#1e1e24", fg="white", font=("Arial", 10))
        self.lbl_page.pack(side=tk.LEFT, padx=6)
        self.btn_next = tk.Button(toolbar, text="Next >", command=self._next_page, state=tk.DISABLED, bg="#27272a", fg="white", padx=8)
        self.btn_next.pack(side=tk.LEFT, padx=4)

        tk.Button(toolbar, text="Zoom +", command=lambda: self._set_zoom(0.15), bg="#27272a", fg="white", padx=8).pack(side=tk.RIGHT, padx=4)
        tk.Button(toolbar, text="Zoom -", command=lambda: self._set_zoom(-0.15), bg="#27272a", fg="white", padx=8).pack(side=tk.RIGHT, padx=4)

        # Main Split
        main_pane = tk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_pane.pack(fill=tk.BOTH, expand=True)

        # Left Canvas
        canvas_frame = tk.Frame(main_pane)
        self.canvas = tk.Canvas(canvas_frame, bg="#2d2d34", cursor="cross")
        v_bar = tk.Scrollbar(canvas_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        h_bar = tk.Scrollbar(canvas_frame, orient=tk.HORIZONTAL, command=self.canvas.xview)
        self.canvas.configure(xscrollcommand=h_bar.set, yscrollcommand=v_bar.set)

        v_bar.pack(side=tk.RIGHT, fill=tk.Y)
        h_bar.pack(side=tk.BOTTOM, fill=tk.X)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        main_pane.add(canvas_frame, width=720)

        # Right Inspector
        right_frame = tk.Frame(main_pane, bg="#ffffff", padx=12, pady=12)
        tk.Label(right_frame, text="Detected Answers & BBoxes", font=("Arial", 12, "bold"), bg="#ffffff").pack(anchor="w")
        self.txt_info = tk.Text(right_frame, wrap=tk.WORD, font=("Consolas", 10), bg="#f4f5f7", relief=tk.FLAT)
        self.txt_info.pack(fill=tk.BOTH, expand=True, pady=8)
        main_pane.add(right_frame)

    def _pick_file(self):
        f = filedialog.askopenfilename(filetypes=[("PDF/Image", "*.pdf *.png *.jpg *.jpeg")])
        if f:
            self._load_file(f)

    def _load_file(self, path):
        self.pdf_path = path
        with open(path, "rb") as f:
            data = f.read()
        self.page_images = process_upload_to_images(data, path)
        self.page_idx = 0
        self.detected_boxes = {}
        self._update_view()

    def _run_ocr(self):
        if not self.page_images:
            return
        img = self.page_images[self.page_idx]
        w, h = img.size
        lines = []

        try:
            from surya.recognition import RecognitionPredictor
            from surya.detection import DetectionPredictor
            from surya.foundation import DetectionModel, RecognitionModel
            det_p = DetectionPredictor(DetectionModel())
            rec_p = RecognitionPredictor(RecognitionModel())
            det_res = det_p([img])[0]
            rec_res = rec_p([img], det_res.bboxes)[0]
            for l in rec_res.text_lines:
                lines.append({"bbox": l.bbox, "text": l.text})
        except Exception as e:
            # Fallback to Gemini 2D grounding
            from services.answer_extractor import extract_answers_from_page
            segs = extract_answers_from_page(img, self.page_idx + 1)
            for s in segs:
                lines.append({
                    "bbox": [int(s.bbox.x * w), int(s.bbox.y * h), int((s.bbox.x + s.bbox.w) * w), int((s.bbox.y + s.bbox.h) * h)],
                    "text": s.text,
                    "label": s.label
                })

        self.detected_boxes[self.page_idx] = lines
        self._update_view()

    def _update_view(self):
        if not self.page_images:
            return
        total = len(self.page_images)
        self.lbl_page.config(text=f"Page {self.page_idx + 1} of {total}")
        self.btn_prev.config(state=tk.NORMAL if self.page_idx > 0 else tk.DISABLED)
        self.btn_next.config(state=tk.NORMAL if self.page_idx < total - 1 else tk.DISABLED)

        base_img = self.page_images[self.page_idx].copy().convert("RGB")
        draw = ImageDraw.Draw(base_img)
        boxes = self.detected_boxes.get(self.page_idx, [])

        self.txt_info.delete("1.0", tk.END)
        self.txt_info.insert(tk.END, f"Found {len(boxes)} boxes on Page {self.page_idx + 1}:\n\n")

        for idx, item in enumerate(boxes):
            x1, y1, x2, y2 = item["bbox"]
            lbl = item.get("label", f"Ans {idx+1}")
            draw.rectangle([x1, y1, x2, y2], outline="#16a34a", width=3)
            draw.rectangle([x1, max(0, y1-20), x1+60, y1], fill="#16a34a")
            draw.text((x1+4, max(0, y1-18)), str(lbl), fill="#ffffff")
            self.txt_info.insert(tk.END, f"[{lbl}] BBox: ({x1},{y1})-({x2},{y2})\nText: {item['text']}\n\n")

        # Scale for zoom
        scaled_w = int(base_img.width * self.zoom)
        scaled_h = int(base_img.height * self.zoom)
        scaled = base_img.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)

        self.tk_img = ImageTk.PhotoImage(scaled)
        self.canvas.delete("all")
        self.canvas.create_image(10, 10, anchor=tk.NW, image=self.tk_img)
        self.canvas.config(scrollregion=(0, 0, scaled_w + 20, scaled_h + 20))

    def _prev_page(self):
        if self.page_idx > 0:
            self.page_idx -= 1
            self._update_view()

    def _next_page(self):
        if self.page_idx < len(self.page_images) - 1:
            self.page_idx += 1
            self._update_view()

    def _set_zoom(self, delta):
        self.zoom = max(0.4, min(3.0, self.zoom + delta))
        self._update_view()

if __name__ == "__main__":
    root = tk.Tk()
    target = sys.argv[1] if len(sys.argv) > 1 else "answer2.pdf"
    app = SuryaViewerApp(root, default_file=target)
    root.mainloop()
