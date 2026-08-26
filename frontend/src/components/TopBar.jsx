import React from 'react';
import { IconExams } from './Icons';
import teacherImg from '../assets/teacher.png';

// Reason: TopBar header matching Pixel Perfect UI layout
export const TopBar = ({ onBack, canGoBack }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="breadcrumb">
          <IconExams />
          <span>Exams</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Help Circle */}
        <button type="button" className="icon-btn" aria-label="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 21, height: 21 }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.44 2.32c-.86.35-1.44 1-1.44 1.93v.25" />
            <line x1="12" y1="17" x2="12" y2="17.01" />
          </svg>
        </button>

        {/* Notifications */}
        <button type="button" className="icon-btn has-dot" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 21, height: 21 }}>
            <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          <span className="dot" />
        </button>

        {/* Sparkles */}
        <button type="button" className="icon-btn" aria-label="AI assistant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 21, height: 21 }}>
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
          </svg>
        </button>

        {/* User Button */}
        <button type="button" className="user-btn">
          <span className="user-avatar-wrap">
            <img src={teacherImg} alt="" className="user-avatar-img" />
          </span>
          <span className="user-name">Madhur Rastogi</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chev">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
};
