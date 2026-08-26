import React, { useState, useEffect, useRef } from 'react';

// Reason: AnswerSheetViewer matching Pixel Perfect UI lined paper, zoom, pagination, and region highlights
export const AnswerSheetViewer = ({ selectedQuestionId, sessionData }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = sessionData?.answer_pages?.length || 4;
  const highlightRef = useRef(null);

  useEffect(() => {
    if (selectedQuestionId === 2 && page === 1 && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedQuestionId, page]);

  const isQ2 = selectedQuestionId === 2;
  const answerPageImg = sessionData?.answer_pages?.[page - 1];

  return (
    <section className="review-sheet-pane">
      {/* Dark Top Header Bar */}
      <div className="review-sheet-header">
        <h2 className="sheet-header-title">Answer Sheet</h2>
        <div className="sheet-header-controls">
          {/* Zoom Pill */}
          <div className="control-pill">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="pill-icon-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span>{zoom}%</span>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="pill-icon-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>

          {/* Page Pill */}
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
      </div>

      {/* Sheet Viewport */}
      <div className="review-sheet-body">
        {answerPageImg ? (
          <div className="real-image-wrapper" style={{ transform: `scale(${zoom / 100})` }}>
            <img src={answerPageImg} alt={`Answer Sheet Page ${page}`} className="real-sheet-image" />
          </div>
        ) : (
          <div
            className="lined-notebook-paper"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {page === 1 ? (
              <>
                <p>
                  <span className="font-bold">Q1.</span> Photosynthesis is the process used by green plants and some other
                  organisms to convert light energy into chemical energy.
                </p>
                <p className="chem-equation-box">
                  6CO₂ + 6H₂O →(Light / Chlorophyll)→ C₆H₁₂O₆ + 6O₂
                </p>
                <p>Sunlight ↓ &nbsp; Carbon dioxide → 🌱 ← Oxygen &nbsp; Water ↑</p>

                {/* Highlighted Answer Region for Q2 */}
                <div
                  ref={highlightRef}
                  className={`answer-highlight-card ${isQ2 ? 'active-highlight' : ''}`}
                >
                  {isQ2 && <span className="highlight-tag">Q2</span>}
                  <p>
                    <span className="font-bold">Q2.</span> The process mainly occurs in the chloroplast of the plant cell. It has two main stages:
                  </p>
                  <p>1. Light reaction — Captures light energy.</p>
                  <p>2. Dark reaction — Uses energy to make glucose.</p>
                </div>

                <p style={{ marginTop: '28px' }}>
                  <span className="font-bold">Q3.</span> Chloroplasts contain chlorophyll a and b, which absorb light and
                  drive the light-dependent reactions in the thylakoid membranes.
                </p>
              </>
            ) : (
              <div className="empty-page-notice">
                Handwritten answer content for Page {page}.
                <br />
                No mapped questions on this page.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
