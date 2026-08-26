import React from 'react';
import {
  IconHome,
  IconClassroom,
  IconAssignments,
  IconExams,
  IconLibrary,
  IconSettings
} from './Icons';
import schoolCrest from '../assets/school-crest.png';
import brandIcon from '../assets/icon.png';

// Reason: Flipped SVG sparkle icon for toolkit
const ToolkitSparkleIcon = ({ className = 'spark-pair' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ transform: 'scaleX(-1)' }}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="currentColor"
      d="M7.195 2.845a.75.75 0 0 0-1.467 0c-.232 1.096-.55 1.835-.99 2.361c-.429.516-1.029.893-1.95 1.166a.75.75 0 0 0 0 1.438c.885.262 1.48.617 1.916 1.125c.444.516.782 1.26 1.024 2.402a.75.75 0 0 0 1.467 0c.242-1.143.58-1.886 1.024-2.402c.436-.508 1.03-.863 1.917-1.125a.75.75 0 0 0 0-1.438c-.886-.262-1.481-.617-1.917-1.125c-.444-.516-.782-1.26-1.024-2.402m8.303 3.251a.75.75 0 0 0-1.458 0c-.554 2.292-1.141 3.674-1.972 4.638c-.82.952-1.947 1.576-3.77 2.192a.75.75 0 0 0 0 1.421c1.904.643 3.046 1.322 3.852 2.292c.819.986 1.362 2.355 1.89 4.537a.75.75 0 0 0 1.458 0c.554-2.291 1.142-3.673 1.972-4.637c.82-.952 1.947-1.576 3.77-2.192a.75.75 0 0 0 0-1.421c-1.907-.644-3.047-1.32-3.852-2.29c-.818-.984-1.36-2.352-1.89-4.54"
    />
  </svg>
);

const NAV_ITEMS = [
  { label: 'Home', icon: IconHome },
  { label: 'My Classroom', icon: IconClassroom },
  { label: 'Assignments', icon: IconAssignments },
  { label: 'Exams', icon: IconExams },
  { label: 'My Library', icon: IconLibrary },
];

// Reason: Sidebar supporting mobile right drawer and collapse states
export const Sidebar = ({ collapsed, setCollapsed, mobileOpen, onCloseMobile, active = 'Exams' }) => {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${collapsed && !mobileOpen ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Expanded Full Sidebar */}
        <div className="sidebar-full">
          <div className="sidebar-top">
            <div className="brand">
              <div className="brand-mark">
                <img src={brandIcon} alt="VedaAI icon" className="brand-mark-img" />
              </div>
              <span className="brand-name">VedaAI</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (mobileOpen) onCloseMobile?.();
                else setCollapsed(true);
              }}
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 20, height: 20 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button type="button" className="toolkit-btn">
            <ToolkitSparkleIcon className="spark-pair" />
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
                  onClick={onCloseMobile}
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

        {/* Collapsed Rail on Desktop */}
        <div className="sidebar-rail">
          <div className="rail-brand">
            <div className="brand-mark">
              <img src={brandIcon} alt="VedaAI icon" className="brand-mark-img" />
            </div>
          </div>
          <button type="button" className="rail-toolkit" title="AI Teacher's Toolkit">
            <ToolkitSparkleIcon className="spark-pair" />
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
    </>
  );
};
