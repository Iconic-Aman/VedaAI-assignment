import React, { useRef } from 'react';
import teacherImg from '../assets/teacher.png';

// Reason: Format file size to string
function fmtSize(bytes) {
  if (!bytes) return '0MB';
  return `${Math.max(1, Math.round(bytes / 1024 / 1024))}MB`;
}

// Reason: Upload screen component matching Pixel Perfect UI
export const UploadScreen = ({ files, setFiles, onStartMapping }) => {
  const targetRef = useRef('question');
  const inputRef = useRef(null);

  const handlePick = (which) => {
    targetRef.current = which;
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const kind = targetRef.current;
    setFiles((prev) => ({
      ...prev,
      [kind]: {
        file: f,
        name: f.name,
        size: fmtSize(f.size),
        pages: '2 Pages'
      }
    }));
    e.target.value = '';
  };

  const handleRemove = (which) => {
    setFiles((prev) => ({ ...prev, [which]: null }));
  };

  const ready = Boolean(files.question && files.answer);

  return (
    <div className="upload-wrap">
      <h1 className="upload-title">
        Upload <span className="highlight-brand">Question Paper &amp; Answer Sheets</span>
      </h1>
      <p className="upload-sub">Upload both files to get started</p>

      {/* Teacher Avatar Hero */}
      <div className="hero-avatar-wrap">
        <div className="hero-badge-container">
          <span className="hero-inner-ring" />
          <img src={teacherImg} alt="VedaAI teaching assistant" className="teacher-img" />
          <span className="satellite-dot dot-1" />
          <span className="satellite-dot dot-2" />
          <span className="satellite-dot dot-3" />
          <span className="satellite-dot dot-4" />
        </div>
      </div>

      {/* Upload Cards Box */}
      <div className="slots-container">
        <div className="slots-grid">
          {/* Question Paper Slot */}
          {files.question ? (
            <div className="filled-slot">
              <div className="file-inner-pill">
                <span className="pdf-badge">PDF</span>
                <div className="file-info-text">
                  <p className="file-info-name">{files.question.name}</p>
                  <p className="file-info-meta">
                    {files.question.size} • {files.question.pages}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove question paper"
                onClick={() => handleRemove('question')}
                className="remove-file-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handlePick('question')}
              className="empty-slot-btn"
            >
              <span className="slot-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 20, height: 20 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span className="slot-title">
                Upload <span className="text-brand">Question Paper</span>
              </span>
              <span className="slot-hint">Max 10MB</span>
            </button>
          )}

          {/* Answer Sheet Slot */}
          {files.answer ? (
            <div className="filled-slot">
              <div className="file-inner-pill">
                <span className="pdf-badge">PDF</span>
                <div className="file-info-text">
                  <p className="file-info-name">{files.answer.name}</p>
                  <p className="file-info-meta">
                    {files.answer.size} • {files.answer.pages}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove answer sheet"
                onClick={() => handleRemove('answer')}
                className="remove-file-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handlePick('answer')}
              className="empty-slot-btn"
            >
              <span className="slot-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 20, height: 20 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span className="slot-title">
                Upload <span className="text-brand">Answer Sheet</span>
              </span>
              <span className="slot-hint">Max 10MB</span>
            </button>
          )}
        </div>
      </div>

      {/* Start Mapping Action */}
      <div className="action-container">
        <button
          type="button"
          disabled={!ready}
          onClick={onStartMapping}
          className={`start-btn ${ready ? 'ready' : 'disabled'}`}
        >
          Start Mapping
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <p className="start-footer-hint">
          Once both files are uploaded, you&apos;ll able to map answers with questions
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};
