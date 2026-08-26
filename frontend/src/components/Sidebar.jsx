import React from 'react';
import {
  IconHome,
  IconClassroom,
  IconAssignments,
  IconExams,
  IconLibrary,
  IconSettings,
  IconSpark
} from './Icons';
import schoolCrest from '../assets/school-crest.png';

const NAV_ITEMS = [
  { label: 'Home', icon: IconHome },
  { label: 'My Classroom', icon: IconClassroom },
  { label: 'Assignments', icon: IconAssignments },
  { label: 'Exams', icon: IconExams },
  { label: 'My Library', icon: IconLibrary },
];

// Reason: Sidebar matching Pixel Perfect UI layout and styling
export const Sidebar = ({ collapsed, setCollapsed, active = 'Exams' }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Expanded Sidebar */}
      <div className="sidebar-full">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5l8 15L20 5h-4l-4 8-4-8H4z" />
              </svg>
            </div>
            <span className="brand-name">VedaAI</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 20, height: 20 }}>
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </button>
        </div>

        <button type="button" className="toolkit-btn">
          <IconSpark className="spark" />
          AI Teacher's Toolkit
        </button>

        <nav className="nav">
          {NAV_ITEMS.map(({ label, icon: Icon }) => {
            const isActive = label === active;
            return (
              <button
                key={label}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="nav-item">
            <IconSettings />
            Settings
          </button>

          <div className="school-card">
            <img
              src={schoolCrest}
              alt="Delhi Public School crest"
              className="school-crest-img"
            />
            <div className="school-meta">
              <div className="school-name">Delhi Public School</div>
              <div className="school-loc">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Rail */}
      <div className="sidebar-rail">
        <div className="rail-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5l8 15L20 5h-4l-4 8-4-8H4z" />
            </svg>
          </div>
        </div>
        <button type="button" className="rail-toolkit" title="AI Teacher's Toolkit">
          <IconSpark className="spark" />
        </button>
        <div className="nav" style={{ marginTop: 12 }}>
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`rail-item ${label === active ? 'active' : ''}`}
              title={label}
            >
              <Icon />
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <img src={schoolCrest} alt="DPS" style={{ width: 32, height: 32 }} />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
              <polyline points="7 17 12 12 7 7" />
              <polyline points="13 17 18 12 13 7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
