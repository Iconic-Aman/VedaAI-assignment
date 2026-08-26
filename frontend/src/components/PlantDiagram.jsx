import React from 'react';

// Reason: SVG diagram rendered on answer sheet page
export const PlantDiagram = () => (
  <div className="ans-diagram">
    <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="40" r="20" fill="none" stroke="#c9a227" strokeWidth="2" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        const x1 = 70 + Math.cos(a) * 24;
        const y1 = 40 + Math.sin(a) * 24;
        const x2 = 70 + Math.cos(a) * 32;
        const y2 = 40 + Math.sin(a) * 32;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a227" strokeWidth="2" />;
      })}
      <text x="100" y="30" fontSize="11" fill="#2b3a63" fontFamily="Inter,sans-serif">
        Sunlight
      </text>
      <line x1="95" y1="25" x2="150" y2="70" stroke="#2b3a63" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <path
        d="M195 170 C 150 150, 140 110, 190 95 C 200 60, 250 55, 260 90 C 300 100, 300 145, 260 160 C 250 180, 210 185, 195 170 Z"
        fill="none"
        stroke="#2f7d4f"
        strokeWidth="2.5"
      />
      <line x1="228" y1="170" x2="228" y2="210" stroke="#6b4423" strokeWidth="3" />
      <path d="M228 210 q -18 6 -26 18" fill="none" stroke="#6b4423" strokeWidth="2" />
      <path d="M228 210 q 18 6 26 18" fill="none" stroke="#6b4423" strokeWidth="2" />
      <path d="M228 210 q 0 10 0 20" fill="none" stroke="#6b4423" strokeWidth="2" />

      <text x="20" y="150" fontSize="11" fill="#2b3a63" fontFamily="Inter,sans-serif">Carbon</text>
      <text x="20" y="163" fontSize="11" fill="#2b3a63" fontFamily="Inter,sans-serif">dioxide</text>
      <line x1="65" y1="150" x2="185" y2="130" stroke="#2b3a63" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <text x="320" y="120" fontSize="11" fill="#2b3a63" fontFamily="Inter,sans-serif">Oxygen</text>
      <line x1="270" y1="115" x2="318" y2="118" stroke="#2b3a63" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <text x="330" y="205" fontSize="11" fill="#2b3a63" fontFamily="Inter,sans-serif">Water</text>
      <line x1="270" y1="205" x2="328" y2="205" stroke="#2b3a63" strokeWidth="1.5" markerStart="url(#arrow)" />

      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#2b3a63" />
        </marker>
      </defs>
    </svg>
  </div>
);
