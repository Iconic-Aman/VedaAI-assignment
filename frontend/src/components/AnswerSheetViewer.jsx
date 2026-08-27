import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

// Reason: AnswerSheetViewer with PDF download, centered download button, and score stamps
export const AnswerSheetViewer = ({ selectedQuestionId, onSelectQuestion, sessionData }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const activeBoxRef = useRef(null);

  const answerPages = sessionData?.answer_pages || [];
  const totalPages = answerPages.length;
  const answerSegments = sessionData?.answer_segments || [];
  const mappings = sessionData?.mappings || [];
  const grading = sessionData?.grading || {};
  const questionsList = sessionData?.questions || [];

  // Calculate overall marks
  let totalEarned = 0;
  let totalMax = 0;
  if (questionsList.length > 0) {
    questionsList.forEach((q) => {
      const g = grading[q.id];
      totalEarned += Number(g?.score || 0);
      totalMax += Number(g?.total || q.max_score || 5);
    });
  } else {
    Object.values(grading).forEach((g) => {
      totalEarned += Number(g?.score || 0);
      totalMax += Number(g?.total || 5);
    });
  }

  const activeMapping = mappings.find((m) => m.question_id === selectedQuestionId);
  const activeSegmentIds = activeMapping ? activeMapping.answer_segment_ids : [];

  useEffect(() => {
    if (selectedQuestionId && activeSegmentIds.length > 0) {
      const targetSeg = answerSegments.find((s) => activeSegmentIds.includes(s.id));
      if (targetSeg && targetSeg.page && targetSeg.page !== page) {
        setPage(targetSeg.page);
      }
      setTimeout(() => {
        activeBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [selectedQuestionId, activeSegmentIds, answerSegments, page]);

  const currentPageSegments = answerSegments.filter((s) => s.page === page);
  const currentImg = answerPages[page - 1];

  const handleBoxClick = (segId) => {
    const mappedItem = mappings.find((m) => m.answer_segment_ids?.includes(segId));
    if (mappedItem && onSelectQuestion) {
      onSelectQuestion(mappedItem.question_id);
    }
  };

  const handleDownloadPdf = () => {
    if (!currentImg) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImg;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.drawImage(img, 0, 0, w, h);
      currentPageSegments.forEach((seg) => {
        const b = seg.bbox || { x: 0.05, y: 0.05, w: 0.9, h: 0.1 };
        const bx = b.x * w;
        const by = b.y * h;
        const bw = b.w * w;
        const bh = b.h * h;

        const mappedItem = mappings.find((m) => m.answer_segment_ids?.includes(seg.id));
        const grade = mappedItem ? grading[mappedItem.question_id] : null;

        let col = '#16a34a';
        let bgCol = 'rgba(34, 197, 94, 0.12)';
        let score = '';
        if (grade) {
          col = grade.score === 0 ? '#dc2626' : grade.score === grade.total ? '#16a34a' : '#d97706';
          bgCol = grade.score === 0 ? 'rgba(239, 68, 68, 0.12)' : grade.score === grade.total ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)';
          score = `${grade.score}/${grade.total}`;
        }

        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(3, Math.round(w / 400));
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        ctx.fillStyle = bgCol;
        ctx.fillRect(bx, by, bw, bh);

        if (seg.label) {
          ctx.fillStyle = col;
          ctx.fillRect(bx, Math.max(0, by - 26), 44, 26);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(seg.label, bx + 6, Math.max(18, by - 7));
        }
        if (score) {
          ctx.fillStyle = col;
          ctx.font = 'bold 22px cursive, sans-serif';
          ctx.fillText(score, bx + bw - 60, Math.max(22, by - 6));
        }
      });

      if (totalMax > 0) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.strokeRect(w - 230, h - 75, 200, 52);
        ctx.fillStyle = 'rgba(254, 242, 242, 0.9)';
        ctx.fillRect(w - 230, h - 75, 200, 52);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 24px cursive, sans-serif';
        ctx.fillText(`Total = ${totalEarned}/${totalMax}`, w - 215, h - 40);
      }

      // Generate PDF from Canvas
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
      pdf.save(`graded_answer_sheet_page_${page}.pdf`);
    };
  };

  return (
    <section className="review-sheet-pane">
      <div className="review-sheet-header">
        <h2 className="sheet-header-title">Answer Sheet</h2>
        {totalPages > 0 && (
          <div className="sheet-header-controls">
            {/* Zoom Pill */}
            <div className="control-pill">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(250, z + 15))}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>

            {/* Square PDF Download Button (Placed in Middle) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="download-square-btn"
              title="Download Graded Sheet as PDF"
              aria-label="Download Graded Sheet as PDF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>

            {/* Page Navigation Pill */}
            <div className="control-pill">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="review-sheet-body">
        {totalPages > 0 && currentImg ? (
          <div className="sheet-scroll-container">
            <div
              className="sheet-image-canvas"
              style={{ width: `${zoom}%`, minWidth: zoom <= 100 ? '100%' : 'auto' }}
            >
              <img
                src={currentImg}
                alt={`Answer Sheet Page ${page}`}
                className="real-sheet-image"
              />
              {/* Bounding Box Overlays */}
              {currentPageSegments.map((seg) => {
                const isActive = activeSegmentIds.includes(seg.id);
                const b = seg.bbox || { x: 0.05, y: 0.05, w: 0.9, h: 0.1 };

                const mappedItem = mappings.find((m) => m.answer_segment_ids?.includes(seg.id));
                const grade = mappedItem ? grading[mappedItem.question_id] : null;

                let tone = 'default';
                let scoreText = '';
                if (grade) {
                  tone = grade.score === 0 ? 'bad' : grade.score === grade.total ? 'good' : 'partial';
                  scoreText = `${grade.score}/${grade.total}`;
                }

                return (
                  <div
                    key={seg.id}
                    ref={isActive ? activeBoxRef : null}
                    onClick={() => handleBoxClick(seg.id)}
                    className={`bbox-overlay bbox-${tone} ${isActive ? 'bbox-active' : ''}`}
                    style={{
                      left: `${b.x * 100}%`,
                      top: `${b.y * 100}%`,
                      width: `${b.w * 100}%`,
                      height: `${b.h * 100}%`
                    }}
                    title={seg.text}
                  >
                    {seg.label && (
                      <span className={`bbox-label-tag tag-${tone}`}>{seg.label}</span>
                    )}
                    {scoreText && (
                      <span className={`bbox-score-stamp stamp-${tone}`}>{scoreText}</span>
                    )}
                  </div>
                );
              })}

              {/* Teacher Overall Score Stamp */}
              {totalMax > 0 && (
                <div className="teacher-bottom-score-box">
                  <span className="teacher-score-text">Total = {totalEarned} / {totalMax}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-answer-sheet-placeholder">
            <div className="placeholder-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 36, height: 36 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="placeholder-title">No Answer Sheet Uploaded</p>
            <p className="placeholder-desc">
              Upload a student handwritten answer sheet to view line bounding boxes and mapped answers.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
