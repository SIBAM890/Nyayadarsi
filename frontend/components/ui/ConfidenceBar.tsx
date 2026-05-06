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
  const isBelowThreshold = pct < 70;

  return (
    <div className="flex flex-col gap-1 w-full py-0.5">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-nyaya-400 uppercase tracking-widest font-semibold">AI Confidence</span>
        {isBelowThreshold && <span className="text-verdict-red font-semibold">Below threshold (70% req)</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-nyaya-400/50 z-10" title="70% Pass Threshold" />
          <div
            className={`h-full rounded-full ${color} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-nyaya-400 font-mono font-medium min-w-[32px] text-right">
          {pct}%
        </span>
      </div>
    </div>
  );
}

export const ConfidenceBar = memo(ConfidenceBarInner);
