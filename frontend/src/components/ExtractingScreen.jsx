import React from 'react';

const STAR_PATH = "M12 0c.9 5.7 6.3 11.1 12 12-5.7.9-11.1 6.3-12 12-.9-5.7-6.3-11.1-12-12C5.7 11.1 11.1 5.7 12 0z";

function Star({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}

// Reason: Extracting screen matching Pixel Perfect UI layout, stars, and animation
export const ExtractingScreen = () => {
  return (
    <div className="extracting-full-container">
      <div className="extracting-center-box">
        <div className="extracting-stars-stage">
          {/* Large star, upper right */}
          <Star className="star-large" />
          {/* Medium star, lower left */}
          <Star className="star-medium" />
          {/* Small star, lower right */}
          <Star className="star-small" />
          {/* Dot, upper left */}
          <span className="star-dot" />
        </div>

        <h1 className="extracting-heading">
          Extracting...
        </h1>
        <p className="extracting-caption">This may take a while</p>
      </div>
    </div>
  );
};
