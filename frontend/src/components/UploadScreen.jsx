import React, { useRef } from 'react';
import { IconUploadArrow } from './Icons';

// Reason: Format file size to human readable string
function fmtSize(bytes) {
  if (!bytes) return '0KB';
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

// Reason: File upload view handling question and answer document inputs
export const UploadScreen = ({ files, setFiles, onStartMapping }) => {
  const qInputRef = useRef(null);
  const aInputRef = useRef(null);

  const handleFile = (kind, file) => {
    if (!file) return;
    setFiles((prev) => ({
      ...prev,
      [kind]: {
        file,
        name: file.name,
        sub: `${fmtSize(file.size)} • Uploaded`
      }
    }));
  };

  const removeFile = (e, kind) => {
    e.stopPropagation();
    setFiles((prev) => ({ ...prev, [kind]: null }));
  };

  const ready = files.question && files.answer;

  return (
    <div className="screen">
      <div className="upload-wrap">
        <h1 className="upload-title">
          Upload <span className="accent">Question Paper &amp; Answer Sheets</span>
        </h1>
        <p className="upload-sub">Upload both files to get started</p>

        <div className="hero-avatar">
          <div className="hero-ring">
            <div className="hero-photo">👩‍🏫</div>
            <span className="hero-dot d1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V4" /><polyline points="5 11 12 4 19 11" /></svg>
            </span>
            <span className="hero-dot d2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V4" /><polyline points="5 11 12 4 19 11" /></svg>
            </span>
            <span className="hero-dot d3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V4" /><polyline points="5 11 12 4 19 11" /></svg>
            </span>
            <span className="hero-dot d4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V4" /><polyline points="5 11 12 4 19 11" /></svg>
            </span>
          </div>
        </div>

        <div className="upload-cards">
          {/* Question Paper Card */}
          <div
            className="upload-card"
            onClick={() => !files.question && qInputRef.current?.click()}
          >
            <input
              type="file"
              ref={qInputRef}
              accept="application/pdf,image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile('question', e.target.files[0])}
            />
            {!files.question ? (
              <div className="upload-card-inner">
                <button className="upload-icon-btn" type="button">
                  <IconUploadArrow />
                </button>
                <div className="upload-label">
                  Upload <span className="accent">Question Paper</span>
                </div>
                <div className="upload-hint">Max 10MB</div>
              </div>
            ) : (
              <div className="file-chip">
                <span className="file-icon pdf">PDF</span>
                <div className="file-meta">
                  <div className="file-name">{files.question.name}</div>
                  <div className="file-sub">{files.question.sub}</div>
                </div>
                <button className="file-remove" onClick={(e) => removeFile(e, 'question')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* Answer Sheet Card */}
          <div
            className="upload-card"
            onClick={() => !files.answer && aInputRef.current?.click()}
          >
            <input
              type="file"
              ref={aInputRef}
              accept="application/pdf,image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile('answer', e.target.files[0])}
            />
            {!files.answer ? (
              <div className="upload-card-inner">
                <button className="upload-icon-btn" type="button">
                  <IconUploadArrow />
                </button>
                <div className="upload-label">
                  Upload <span className="accent">Answer Sheet</span>
                </div>
                <div className="upload-hint">Max 10MB</div>
              </div>
            ) : (
              <div className="file-chip">
                <span className="file-icon pdf">PDF</span>
                <div className="file-meta">
                  <div className="file-name">{files.answer.name}</div>
                  <div className="file-sub">{files.answer.sub}</div>
                </div>
                <button className="file-remove" onClick={(e) => removeFile(e, 'answer')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className="start-mapping-btn"
          disabled={!ready}
          onClick={onStartMapping}
        >
          Start Mapping
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <p className="start-hint">
          {ready
            ? 'Both files are ready — click Start Mapping to extract questions and answers'
            : "Once both files are uploaded, you'll be able to map answers with questions"}
        </p>
      </div>
    </div>
  );
};
