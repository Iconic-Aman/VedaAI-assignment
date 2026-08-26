import React, { useState, useEffect, useRef } from 'react';
import { PlantDiagram } from './PlantDiagram';

// Reason: Right pane for answer sheet viewing, zoom, pagination, and region highlight
export const AnswerSheetViewer = ({ selectedQuestionId }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 4;
  const highlightRef = useRef(null);

  useEffect(() => {
    if (selectedQuestionId === 2 && page === 1 && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedQuestionId, page]);

  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(200, Math.max(50, prev + delta)));
  };

  const isQ2 = selectedQuestionId === 2;

  return (
    <div className="results-right">
      <div className="results-right-head">
        <h3>Answer Sheet</h3>
        <div className="sheet-controls">
          <div className="zoom-control">
            <button className="zoom-btn" onClick={() => handleZoom(-10)} title="Zoom Out">
              −
            </button>
            <span>{zoom}%</span>
            <button className="zoom-btn" onClick={() => handleZoom(10)} title="Zoom In">
              +
            </button>
          </div>
          <div className="page-control">
            <button
              className="zoom-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="zoom-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="sheet-viewport">
        <div
          className="sheet-page"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {page === 1 ? (
            <>
              <div className="ans-block">
                <span className="q-label">Q1.</span> Photosynthesis is the process used by green
                plants and some other organisms to convert light energy into chemical energy.
                <div className="ans-eq">
                  6CO<sub>2</sub> + 6H<sub>2</sub>O &nbsp;—Light / Chlorophyll→&nbsp; C<sub>6</sub>H
                  <sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>
                </div>
                <PlantDiagram />
              </div>

              <div
                ref={highlightRef}
                className={`ans-block ${isQ2 ? 'highlight' : ''}`}
                id="ans-q2"
              >
                {isQ2 && <span className="ans-tag">Q2</span>}
                <span className="q-label">Q2.</span> The process mainly occurs in the chloroplast
                of the plant cell. It has two main stages:
                <br />
                1. Light reaction – Captures light energy.
                <br />
                2. Dark reaction – Uses energy to make glucose.
              </div>

              <div className="ans-block" style={{ opacity: 0.55 }}>
                <span className="q-label">Q1.</span> Photosynthesis is the process used by green
                plants and some other organisms to convert light energy into chemical energy.
              </div>
            </>
          ) : (
            <div className="page-placeholder">
              Additional handwritten answer content on Page {page}.
              <br />
              No mapped question is highlighted on this page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
