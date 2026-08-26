import React from 'react';
import { IconExams } from './Icons';
import teacherImg from '../assets/teacher.png';

// Reason: TopBar with mobile-only 3-lines button
export const TopBar = ({ onBack, canGoBack, onToggleSidebar }) => {
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 20, height: 20 }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Desktop Breadcrumb */}
        <div className="breadcrumb desktop-only">
          <IconExams />
          <span>Exams</span>
        </div>

        {/* Mobile Brand Name */}
        <span className="mobile-brand-title mobile-only">VedaAI</span>
      </div>

      <div className="topbar-right">
        {/* Help Circle Icon (Desktop only) */}
        <button type="button" className="top-action-btn desktop-only" aria-label="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="top-icon">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.75" fill="currentColor" />
          </svg>
        </button>

        {/* Notification Bell with Orange Dot */}
        <button type="button" className="top-action-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="top-icon">
            <path d="M18 8.5A6 6 0 0 0 6 8.5c0 7-3 8.5-3 8.5h18s-3-1.5-3-8.5" />
            <path d="M13.7 20.5a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="top-orange-badge" />
        </button>

        {/* 4-point Solid Sparkle Icon (Desktop only) */}
        <button type="button" className="top-action-btn desktop-only" aria-label="AI assistant">
          <svg viewBox="0 0 24 24" fill="currentColor" className="top-icon-sparkle">
            <path d="M12 2 C12 7.5, 16.5 12, 22 12 C16.5 12, 12 16.5, 12 22 C12 16.5, 7.5 12, 2 12 C7.5 12, 12 7.5, 12 2 Z" />
          </svg>
        </button>

        {/* User Button */}
        <button type="button" className="user-btn">
          <span className="user-avatar-wrap">
            <img src={teacherImg} alt="User avatar" className="user-avatar-img" />
          </span>
          <span className="user-name desktop-only">Madhur Rastogi</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chev desktop-only">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* 3-Lines Menu Toggle Button (Mobile Only) */}
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
          title="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 22, height: 22 }}>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
};
