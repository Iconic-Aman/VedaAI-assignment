import React, { useState } from 'react';

// Reason: Helper to determine score badge CSS class
function scoreClass(q) {
  if (q.score === 0) return 'zero';
  if (q.score === q.total) return 'full';
  return 'partial';
}

// Reason: Left pane listing extracted questions with accordion & feedback
export const QuestionList = ({ questions, selectedId, onSelectQuestion }) => {
  const [openMap, setOpenMap] = useState({ 2: true });

  const toggleItem = (n) => {
    setOpenMap((prev) => ({ ...prev, [n]: !prev[n] }));
    onSelectQuestion(selectedId === n ? null : n);
  };

  const handleExpandAll = () => {
    const allOpen = questions.every((q) => openMap[q.n]);
    const next = {};
    questions.forEach((q) => {
      next[q.n] = !allOpen;
    });
    setOpenMap(next);
  };

  const allOpen = questions.length > 0 && questions.every((q) => openMap[q.n]);

  return (
    <div className="results-left">
      <div className="results-left-head">
        <h3>
          Extracted Questions <span>(from question paper)</span>
        </h3>
        <button className="link-btn" onClick={handleExpandAll}>
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="question-list">
        {questions.map((q) => {
          const isOpen = !!openMap[q.n];
          const isSelected = selectedId === q.n;

          return (
            <div
              key={q.n}
              className={`q-item ${isSelected ? 'selected' : ''} ${isOpen ? 'open' : ''}`}
            >
              <div className="q-item-head" onClick={() => toggleItem(q.n)}>
                <span className="q-num">{q.n}</span>
                <span className="q-text">{q.text}</span>
                <span className={`q-score ${scoreClass(q)}`}>
                  {q.score}/{q.total}
                </span>
                <svg
                  className="q-chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              <div className="q-body">
                <div className="q-feedback">
                  <div className="q-feedback-label">AI Feedback</div>
                  <div className="q-feedback-text">{q.feedback}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
