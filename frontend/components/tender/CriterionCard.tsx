/**
 * CriterionCard — displays a single extracted tender criterion.
 */
import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TenderCriterion } from '@/types/tender';

interface CriterionCardProps {
  criterion: TenderCriterion;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  technical: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  compliance: 'bg-purple-500/10 text-purple-400 border-purple-500/15',
};

function CriterionCardInner({ criterion, index }: CriterionCardProps) {
  const colors = TYPE_COLORS[criterion.type] || TYPE_COLORS.compliance;

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase border ${colors}`}>
            {criterion.type}
          </span>
          {criterion.mandatory ? (
            <span className="badge-red text-[10px]">MANDATORY</span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-nyaya-400 border border-white/[0.06]">
              DISCRETIONARY
            </span>
          )}
          {criterion.blocker && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-verdict-red/10 text-verdict-red border border-verdict-red/15">
              BLOCKER
            </span>
          )}
        </div>
        <span className="text-[11px] text-nyaya-500 font-mono">{criterion.criterion_id}</span>
      </div>

      <p className="text-sm text-nyaya-200 leading-relaxed mb-2">{criterion.description}</p>

      {criterion.threshold !== null && criterion.threshold !== undefined && (
        <div className="flex items-center gap-4 text-xs text-nyaya-400">
          <span>
            Threshold:{' '}
            <span className="text-white font-medium">
              {criterion.threshold_unit === 'INR'
                ? `₹${(criterion.threshold / 10000000).toFixed(1)} Cr`
                : criterion.threshold}
            </span>{' '}
            {criterion.threshold_unit !== 'INR' ? criterion.threshold_unit : ''}
          </span>
          {criterion.language_signal && (
            <span>
              Signal: <span className="font-mono text-accent-400">{criterion.language_signal}</span>
            </span>
          )}
        </div>
      )}

      {criterion.specificity_alert && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/15 text-xs text-accent-400 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          AI flagged this criterion as potentially restrictive
        </div>
      )}
    </div>
  );
}

export const CriterionCard = memo(CriterionCardInner);
