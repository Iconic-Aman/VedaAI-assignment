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

// Reason: School green emblem badge matching the UI design
const SchoolEmblem = () => (
  <svg viewBox="0 0 32 32" fill="none" className="school-emblem-svg">
    <circle cx="16" cy="16" r="14" fill="#eaf7ed" stroke="#2e7d32" strokeWidth="1.5" />
    <path d="M16 8l4 6h-8l4-6z" fill="#2e7d32" />
    <path d="M16 12l5 7h-10l5-7z" fill="#2e7d32" opacity="0.8" />
    <rect x="15" y="19" width="2" height="5" fill="#4e342e" />
  </svg>
);

// Reason: Sidebar navigation matching Figma screenshot
export const Sidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Expanded Sidebar */}
      <div className="sidebar-full">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">V</span>
            <span className="brand-name">VedaAI</span>
          </div>
          <button
            className="icon-btn ghost"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </button>
        </div>

        <button className="toolkit-btn">
          <IconSpark />
          AI Teacher's Toolkit
        </button>

        <nav className="nav">
          <button className="nav-item"><IconHome />Home</button>
          <button className="nav-item"><IconClassroom />My Classroom</button>
          <button className="nav-item"><IconAssignments />Assignments</button>
          <button className="nav-item active"><IconExams />Exams</button>
          <button className="nav-item"><IconLibrary />My Library</button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><IconSettings />Settings</button>
          <div className="school-card">
            <div className="school-logo"><SchoolEmblem /></div>
            <div className="school-meta">
              <div className="school-name">Delhi Public School</div>
              <div className="school-loc">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Rail */}
      <div className="sidebar-rail">
        <div className="rail-brand"><span className="brand-mark">V</span></div>
        <button className="rail-toolkit" title="AI Teacher's Toolkit">
          <IconSpark />
        </button>
        <div className="rail-nav">
          <button className="rail-item" title="Home"><IconHome /></button>
          <button className="rail-item" title="My Classroom"><IconClassroom /></button>
          <button className="rail-item" title="Assignments"><IconAssignments /></button>
          <button className="rail-item active" title="Exams"><IconExams /></button>
          <button className="rail-item" title="My Library"><IconLibrary /></button>
        </div>
        <div className="rail-bottom" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div className="rail-shield" title="Delhi Public School"><SchoolEmblem /></div>
          <button
            className="icon-btn ghost"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="7 17 12 12 7 7" />
              <polyline points="13 17 18 12 13 7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
