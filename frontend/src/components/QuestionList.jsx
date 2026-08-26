import React, { useState } from 'react';

function getTone(q) {
  if (q.score === 0) return 'tone-bad';
  if (q.score === q.total) return 'tone-good';
  return 'tone-partial';
}

// Reason: QuestionList component matching Pixel Perfect UI ExamReview.tsx
export const QuestionList = ({ questions, selectedId, onSelectQuestion }) => {
  const [openIds, setOpenIds] = useState([2]);

  const toggle = (n) => {
    setOpenIds((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
    onSelectQuestion(selectedId === n ? null : n);
  };

  const allOpen = questions.length > 0 && openIds.length === questions.length;

  const handleToggleAll = () => {
    setOpenIds(allOpen ? [] : questions.map((q) => q.n));
  };

  return (
    <section className="review-questions-pane">
      <div className="review-questions-header">
        <h2 className="review-header-title">
          Extracted Questions <span className="review-header-sub">(from question paper)</span>
        </h2>
        <button
          type="button"
          onClick={handleToggleAll}
          className="review-toggle-all-btn"
        >
          {allOpen ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="review-questions-list">
        {questions.map((q) => {
          const isOpen = openIds.includes(q.n);
          const isSelected = selectedId === q.n;
          const toneClass = getTone(q);

          return (
            <div
              key={q.n}
              className={`question-row-card ${isOpen || isSelected ? 'active-row' : ''}`}
            >
              <div className="question-row-header" onClick={() => toggle(q.n)}>
                <span className={`question-number-badge ${isOpen ? 'active-badge' : ''}`}>
                  {q.n}
                </span>
                <p className="question-row-text">{q.text}</p>
                <span className={`question-score-pill ${toneClass}`}>
                  {q.score} / {q.total}
                </span>
                <button
                  type="button"
                  aria-label={isOpen ? 'Collapse question' : 'Expand question'}
                  className="question-row-chevron-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-icon">
                    {isOpen ? (
                      <polyline points="18 15 12 9 6 15" />
                    ) : (
                      <polyline points="6 9 12 15 18 9" />
                    )}
                  </svg>
                </button>
              </div>

              {isOpen && (
                <div className="question-feedback-drawer">
                  <div className="question-feedback-inner">
                    <p className="feedback-heading">AI Feedback</p>
                    <p className="feedback-content">{q.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
