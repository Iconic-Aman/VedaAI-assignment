import React, { useRef } from 'react';
import teacherHero from '../assets/teacher-hero.png';

// Reason: Format file size
function fmtSize(bytes) {
  if (!bytes) return '0MB';
  return `${Math.max(1, Math.round(bytes / 1024 / 1024))}MB`;
}

// Reason: UploadScreen requiring both question paper and answer sheet to enable Start Mapping
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
    const info = {
      file: f,
      name: f.name,
      size: fmtSize(f.size),
      pages: '2 Pages'
    };
    setFiles((prev) => ({ ...prev, [kind]: info }));
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
      <p className="upload-sub">Upload files to get started</p>

      {/* Framer Hero Avatar */}
      <div className="hero-avatar-wrap">
        <div className="hero-stage">
          <div className="hero-bg-blur" />
          <div className="hero-bg-circle" />
          <div className="hero-img-wrap">
            <img src={teacherHero} alt="VedaAI teacher" className="hero-girl-img" />
          </div>

          {/* Satellite Badges */}
          <div className="framer-satellite sat-top-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
          </div>
          <div className="framer-satellite sat-top-right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
          </div>
          <div className="framer-satellite sat-bottom-right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </div>
          <div className="framer-satellite sat-bottom-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l1.8 5.6L19.4 9l-5.6 1.8L12 16.4 10.2 10.8 4.6 9l5.6-1.4L12 2z" /></svg>
          </div>
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
                  <p className="file-info-meta">{files.question.size}</p>
                </div>
              </div>
              <button type="button" aria-label="Remove question paper" onClick={() => handleRemove('question')} className="remove-file-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => handlePick('question')} className="empty-slot-btn">
              <span className="slot-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 20, height: 20 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </span>
              <span className="slot-title">Upload <span className="text-brand">Question Paper</span></span>
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
                  <p className="file-info-meta">{files.answer.size}</p>
                </div>
              </div>
              <button type="button" aria-label="Remove answer sheet" onClick={() => handleRemove('answer')} className="remove-file-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => handlePick('answer')} className="empty-slot-btn">
              <span className="slot-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 20, height: 20 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </span>
              <span className="slot-title">Upload <span className="text-brand">Answer Sheet</span></span>
              <span className="slot-hint">Max 10MB</span>
            </button>
          )}
        </div>
      </div>

      {/* Start Mapping Action */}
      <div className="action-container">
        <button type="button" disabled={!ready} onClick={onStartMapping} className={`start-btn ${ready ? 'ready' : 'disabled'}`}>
          Start Mapping
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>
        <p className="start-footer-hint">
          {ready
            ? "Both files ready — click Start Mapping to evaluate answers"
            : "Upload both Question Paper and Answer Sheet to start mapping"}
        </p>
      </div>

      <input ref={inputRef} type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
};
