import React from 'react';

// Reason: Extracting intermediate screen matching exact Figma sparkle visual
export const ExtractingScreen = () => {
  return (
    <div className="screen">
      <div className="extracting-wrap">
        <svg viewBox="0 0 120 120" fill="none" className="extracting-sparkles">
          {/* Small orange dot on mid-left */}
          <circle cx="30" cy="44" r="5" fill="url(#sparkGrad)" />

          {/* Large main orange star (top-right) */}
          <path
            d="M74 8 C74 24, 88 38, 104 38 C88 38, 74 52, 74 68 C74 52, 60 38, 44 38 C60 38, 74 24, 74 8 Z"
            fill="url(#sparkGrad)"
          />

          {/* Medium orange star (bottom-left) */}
          <path
            d="M52 50 C52 64, 64 76, 78 76 C64 76, 52 88, 52 102 C52 88, 40 76, 26 76 C40 76, 52 64, 52 50 Z"
            fill="url(#sparkGrad)"
          />

          {/* Small orange star (mid-right) */}
          <path
            d="M96 68 C96 73, 101 78, 106 78 C101 78, 96 83, 96 88 C96 83, 91 78, 86 78 C91 78, 96 73, 96 68 Z"
            fill="url(#sparkGrad)"
          />

          <defs>
            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7a52" />
              <stop offset="50%" stopColor="#ff5722" />
              <stop offset="100%" stopColor="#f44310" />
            </linearGradient>
          </defs>
        </svg>

        <h2 className="extracting-title">Extracting...</h2>
        <p className="extracting-sub">This may take a while</p>
      </div>
    </div>
  );
};
