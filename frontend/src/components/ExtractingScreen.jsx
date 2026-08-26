import React from 'react';
import { IconSpark } from './Icons';

// Reason: Intermediate extracting/processing state screen
export const ExtractingScreen = () => {
  return (
    <div className="screen">
      <div className="extracting-wrap">
        <IconSpark className="spark-big" />
        <h2>Extracting…</h2>
        <p>This may take a while</p>
      </div>
    </div>
  );
};
