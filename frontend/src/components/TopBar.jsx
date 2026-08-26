import React from 'react';
import { IconDoc } from './Icons';

// Reason: TopBar header component with breadcrumbs and user details
export const TopBar = ({ onBack, canGoBack }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn ghost"
          onClick={onBack}
          disabled={!canGoBack}
          title="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="breadcrumb">
          <IconDoc />
          Exams
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn ghost" title="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.44 2.32c-.86.35-1.44 1-1.44 1.93v.25" />
            <line x1="12" y1="17" x2="12" y2="17.01" />
          </svg>
        </button>
        <button className="icon-btn ghost has-dot" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          <span className="dot" />
        </button>
        <button className="icon-btn ghost" title="New">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <div className="user-chip">
          <span className="avatar">MR</span>
          <span className="user-name">Madhur Rastogi</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chev">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
};
