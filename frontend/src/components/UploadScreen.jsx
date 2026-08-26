import React, { useRef } from 'react';
import { IconUploadArrow } from './Icons';

// Reason: Format file size
function fmtSize(bytes) {
  if (!bytes) return '0KB';
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

// Reason: Upload view matching Figma screenshot layout
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

  const ready = Boolean(files.question && files.answer);

  return (
    <div className="screen">
      <div className="upload-wrap">
        <h1 className="upload-title">
          Upload <span className="title-highlight">Question Paper &amp; Answer Sheets</span>
        </h1>
        <p className="upload-sub">Upload both files to get started</p>

        {/* Teacher Avatar Hero */}
        <div className="hero-avatar">
          <div className="hero-badge-bg">
            <div className="hero-character">
              <svg viewBox="0 0 100 100" className="teacher-svg">
                <circle cx="50" cy="50" r="48" fill="#ffd9cc" />
                <circle cx="50" cy="38" r="18" fill="#5d4037" />
                <circle cx="50" cy="39" r="14" fill="#ffccbc" />
                {/* Hair */}
                <path d="M34 38 C34 24, 66 24, 66 38 C66 30, 34 30, 34 38 Z" fill="#2c3437" />
                <path d="M32 38 C32 48, 38 52, 38 52 C38 52, 36 40, 38 36 Z" fill="#2c3437" />
                <path d="M68 38 C68 48, 62 52, 62 52 C62 52, 64 40, 62 36 Z" fill="#2c3437" />
                {/* Glasses */}
                <circle cx="44" cy="38" r="4" fill="none" stroke="#2c3437" strokeWidth="1.5" />
                <circle cx="56" cy="38" r="4" fill="none" stroke="#2c3437" strokeWidth="1.5" />
                <line x1="48" y1="38" x2="52" y2="38" stroke="#2c3437" strokeWidth="1.5" />
                {/* Body & Binder */}
                <path d="M30 85 C30 65, 70 65, 70 85 Z" fill="#2d3748" />
                <polygon points="46,65 54,65 52,78 48,78" fill="#ffffff" />
                <rect x="42" y="66" width="16" height="20" rx="2" fill="#4a5568" />
                <rect x="44" y="68" width="12" height="16" rx="1" fill="#ffffff" />
              </svg>
            </div>

            {/* Orbiting Badge Icons */}
            <div className="orbit-icon orbit-top-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
            </div>
            <div className="orbit-icon orbit-top-right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
            </div>
            <div className="orbit-icon orbit-bottom-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <div className="orbit-icon orbit-bottom-right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /></svg>
            </div>
          </div>
        </div>

        {/* Upload Cards */}
        <div className="upload-cards">
          {/* Question Paper */}
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
                <div className="upload-icon-box">
                  <IconUploadArrow />
                </div>
                <div className="upload-label">
                  Upload <span className="text-orange">Question Paper</span>
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

          {/* Answer Sheet */}
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
                <div className="upload-icon-box">
                  <IconUploadArrow />
                </div>
                <div className="upload-label">
                  Upload <span className="text-orange">Answer Sheet</span>
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

        {/* Start Mapping Action */}
        <button
          className="start-mapping-btn"
          disabled={!ready}
          onClick={onStartMapping}
        >
          Start Mapping
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <p className="start-hint">
          Once both files are uploaded, you'll be able to map answers with questions
        </p>
      </div>
    </div>
  );
};
