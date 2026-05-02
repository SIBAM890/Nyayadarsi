/**
 * ConfidenceBar — horizontal progress bar with color coding by confidence level.
 */
import React, { memo } from 'react';

interface ConfidenceBarProps {
  value: number;
}

function ConfidenceBarInner({ value }: ConfidenceBarProps) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? 'bg-verdict-green' : pct >= 60 ? 'bg-verdict-yellow' : 'bg-verdict-red';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-nyaya-400/60 font-mono w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}

export const ConfidenceBar = memo(ConfidenceBarInner);
