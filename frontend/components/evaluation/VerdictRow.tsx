/**
 * VerdictRow — displays evaluation result for a single criterion.
 */
import React, { memo } from 'react';
import type { CriterionResult } from '@/types/evaluation';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';

interface VerdictRowProps {
  verdict: CriterionResult;
}

function VerdictRowInner({ verdict: v }: VerdictRowProps) {
  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <VerdictBadge verdict={v.verdict} />
            <span className="text-xs font-mono text-nyaya-400/40">{v.criterion_id}</span>
            {v.mandatory && <span className="badge-red text-[10px]">MANDATORY</span>}
          </div>
          <p className="text-sm text-nyaya-100/80">{v.criterion}</p>
        </div>
      </div>
      {v.confidence != null && <ConfidenceBar value={v.confidence} />}
      {v.citation && (
        <div className="px-3 py-2 rounded-lg bg-nyaya-800/30 border border-white/5 text-xs text-nyaya-300/60 leading-relaxed">
          📎 {v.citation}
        </div>
      )}
      {v.ambiguity && (
        <div className="px-3 py-2 rounded-lg bg-verdict-yellow/10 border border-verdict-yellow/20 text-xs text-verdict-yellow/80 leading-relaxed">
          ⚠️ {v.ambiguity}
        </div>
      )}
    </div>
  );
}

export const VerdictRow = memo(VerdictRowInner);
