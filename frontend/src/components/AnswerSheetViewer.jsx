import React, { useState, useEffect, useRef } from 'react';

// Reason: AnswerSheetViewer edge-to-edge responsive canvas with dynamic zoom
export const AnswerSheetViewer = ({ selectedQuestionId, onSelectQuestion, sessionData }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const activeBoxRef = useRef(null);

  const answerPages = sessionData?.answer_pages || [];
  const totalPages = answerPages.length;
  const answerSegments = sessionData?.answer_segments || [];
  const mappings = sessionData?.mappings || [];

  // Find active segment IDs for selected question
  const activeMapping = mappings.find((m) => m.question_id === selectedQuestionId);
  const activeSegmentIds = activeMapping ? activeMapping.answer_segment_ids : [];

  // Auto-navigate to page and scroll to active answer box
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

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(50, Math.min(250, prev + delta)));
  };

  return (
    <section className="review-sheet-pane">
      <div className="review-sheet-header">
        <h2 className="sheet-header-title">Answer Sheet</h2>
        {totalPages > 0 && (
          <div className="sheet-header-controls">
            {/* Functional Zoom Pill */}
            <div className="control-pill">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => handleZoomChange(-15)}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => handleZoomChange(15)}
                className="pill-icon-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>

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
                return (
                  <div
                    key={seg.id}
                    ref={isActive ? activeBoxRef : null}
                    onClick={() => handleBoxClick(seg.id)}
                    className={`bbox-overlay ${isActive ? 'bbox-active' : ''}`}
                    style={{
                      left: `${b.x * 100}%`,
                      top: `${b.y * 100}%`,
                      width: `${b.w * 100}%`,
                      height: `${b.h * 100}%`
                    }}
                    title={seg.text}
                  >
                    {seg.label && <span className="bbox-label-tag">{seg.label}</span>}
                  </div>
                );
              })}
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
