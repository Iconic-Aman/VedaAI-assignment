# 🎓 VedaAI - Automated Exam Grading & Handwritten Answer Mapping

> An end-to-end AI-powered document intelligence system that extracts printed exam questions, isolates student handwritten answers using 2D spatial grounding, maps responses to questions, performs automated grading, and renders interactive annotated answer sheets.

🔗 **Live Deployment**: [https://veda-ai-assignment-iota.vercel.app/](https://veda-ai-assignment-iota.vercel.app/)  
📹 **Video Demo**: [Watch Walkthrough & Demo](https://go.screenpal.com/watch/cOjtqenwjy1)

---

## 📸 Application Screenshots & Demo

### 1. Document Upload Screen
![VedaAI Upload Interface](docs/images/upload_screen.png)

### 2. Live Graded Answer Sheet with 2D Spatial Grounding & Score Stamps
![Graded Answer Sheet](docs/images/results_evaluation.png)

### 3. Complete Evaluated Results Overview
![VedaAI Demo Page](docs/images/demo_page.png)

---

## 📁 Sample Test Documents

Sample question papers and handwritten answer sheets are organized in the [`sample_documents/`](./sample_documents/) folder:
- **Questions**: [`question2.pdf`](./sample_documents/question2.pdf), [`history-ques-paper.pdf`](./sample_documents/history-ques-paper.pdf), [`geography-question-paper.pdf`](./sample_documents/geography-question-paper.pdf)
- **Answers**: [`answer2.pdf`](./sample_documents/answer2.pdf), [`history-ans-sheet.pdf`](./sample_documents/history-ans-sheet.pdf), [`geograph-answer-sheet.pdf`](./sample_documents/geograph-answer-sheet.pdf)

---

## ✨ Key Features & Capabilities

- 📄 **Printed Question Extraction**: Concurrently extracts exam questions, sub-parts, full text, and maximum marks directly from PDF question papers.
- ✍️ **Handwritten Answer Localization**: Detects handwritten responses with exact 2D spatial bounding box coordinates `[ymin, xmin, ymax, xmax]` normalized on a 0–1000 scale.
- 🎯 **3-Pass Intelligent Mapping**: Matches answers to questions via direct label matching, fuzzy text matching, and semantic LLM reasoning.
- 🔴🟢 **Color-Coded Visual Evaluation**:
  - **Green Box (`#16a34a`)**: Full marks awarded.
  - **Orange Box (`#d97706`)**: Partial marks awarded.
  - **Red Box (`#dc2626`)**: Incorrect response (0 marks).
- 🏷️ **Teacher Handwritten Score Annotations**: Shows question scores (e.g., `0/2`, `2/3`, `5/5`) stamped directly over handwritten answer blocks.
- 📊 **Overall Marks Summary**: Automatically tallies total earned score vs total exam marks (e.g. `Total = 18 / 30`) stamped at the bottom of the answer sheet.
- 📥 **PDF Export**: Download the complete graded answer sheet with high-resolution annotations and teacher marks as a PDF file.
- 🔍 **Interactive Canvas & Responsive UI**: Smooth zooming (50% to 250%), auto-scrolls to answers upon clicking questions, and adapts to desktop and mobile screens.
- 🔑 **Multi-Key Failover & Gemini Model Selection**: Round-robin API key pool across multiple Gemini keys (`GEMINI_API_KEY1`, `KEY2`, `KEY3`) with instant failover on 429 quota limits.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React, Vite, CSS Modules / Custom Design System, jsPDF, Framer-inspired UI
- **Backend**: FastAPI, Python 3.10+, PyMuPDF (`fitz`), Pillow, Google Generative AI Python SDK
- **AI Models**: Google Gemini Vision (`gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`)

---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # On Windows
source venv/bin/activate    # On Linux/macOS
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration (`backend/.env`)

```env
GEMINI_API_KEY1=your_gemini_api_key_1
GEMINI_API_KEY2=your_gemini_api_key_2
GEMINI_API_KEY3=your_gemini_api_key_3
GEMINI_MODEL=gemini-3.7-flash
API_BEARER_TOKEN=aman-secret
```

---

## 📌 Assumptions & Limitations

- **Session In-Memory Scope**: No authentication or persistent database — data is handled in-memory for the session, per assignment scope.
- **Bounding Box Approximation**: Answer-region highlighting is based on approximate bounding boxes returned by the model; may be slightly imprecise for very dense or overlapping handwriting.
- **Handwriting Quality**: Grading and AI feedback are generated per question; accuracy depends on handwriting legibility and answer sheet image quality.
- **Single-Student Workflow**: Currently tested with single-student answer sheets; batch/multi-student upload is not yet supported.
- **Document Page Limits**: Optimized for 1 to 2 pages per upload session for fast parallel processing and rate-limit preservation. Multi-page answers are supported, but very long documents (20+ pages) may require additional chunking for reliable extraction within free-tier rate limits.
- **Slot Specificity**: Files must be uploaded to their designated slots (Question Paper in Question slot, Answer Sheet in Answer slot). Swapping them will prevent accurate question-to-answer evaluation.
- **Error Recovery**: No retry/error-recovery UI for failed extraction — a failed page currently requires re-upload.
- **Free-Tier Infrastructure**: Deployed on free-tier infrastructure (Vercel + Gemini free tier), so response times and rate limits may vary under heavy use.
