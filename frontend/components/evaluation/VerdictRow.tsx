/**
 * VerdictRow — displays evaluation result for a single criterion.
 */
import React, { memo } from 'react';
import { Paperclip, AlertTriangle } from 'lucide-react';
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
            <span className="text-xs font-mono text-nyaya-500">{v.criterion_id}</span>
            {v.mandatory && <span className="badge-red text-[10px]">MANDATORY</span>}
          </div>
          <p className="text-sm text-nyaya-200">{v.criterion}</p>
        </div>
      </div>
      {v.confidence != null && <ConfidenceBar value={v.confidence} />}
      {v.citation && (
        <div className="px-3 py-2 rounded-lg bg-surface-3 border border-white/[0.04] text-xs text-nyaya-300 leading-relaxed flex items-start gap-2">
          <Paperclip className="w-3 h-3 flex-shrink-0 mt-0.5 text-nyaya-500" />
          <span>{v.citation}</span>
        </div>
      )}
      {v.ambiguity && (
        <div className="px-3 py-2 rounded-lg bg-verdict-yellow/10 border border-verdict-yellow/15 text-xs text-verdict-yellow/80 leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>{v.ambiguity}</span>
        </div>
      )}
    </div>
  );
}

export const VerdictRow = memo(VerdictRowInner);
