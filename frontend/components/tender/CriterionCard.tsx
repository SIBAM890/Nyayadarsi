/**
 * CriterionCard — displays a single extracted tender criterion.
 */
import React, { memo } from 'react';
import type { TenderCriterion } from '@/types/tender';

interface CriterionCardProps {
  criterion: TenderCriterion;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  financial: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  technical: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
  compliance: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
};

function CriterionCardInner({ criterion, index }: CriterionCardProps) {
  const colors = TYPE_COLORS[criterion.type] || TYPE_COLORS.compliance;

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-gradient-to-r ${colors} border`}>
            {criterion.type}
          </span>
          {criterion.mandatory ? (
            <span className="badge-red text-[10px]">MANDATORY</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-nyaya-600/20 text-nyaya-300 border border-nyaya-500/20">
              DISCRETIONARY
            </span>
          )}
          {criterion.blocker && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-600/20 text-red-400 border border-red-500/20">
              BLOCKER
            </span>
          )}
        </div>
        <span className="text-xs text-nyaya-400/40 font-mono">{criterion.criterion_id}</span>
      </div>

      <p className="text-sm text-nyaya-100/80 leading-relaxed mb-3">{criterion.description}</p>

      {criterion.threshold !== null && criterion.threshold !== undefined && (
        <div className="flex items-center gap-4 text-xs text-nyaya-300/50">
          <span>
            Threshold:{' '}
            <span className="text-white font-semibold">
              {criterion.threshold_unit === 'INR'
                ? `₹${(criterion.threshold / 10000000).toFixed(1)} Cr`
                : criterion.threshold}
            </span>{' '}
            {criterion.threshold_unit !== 'INR' ? criterion.threshold_unit : ''}
          </span>
          {criterion.language_signal && (
            <span>
              Signal: <span className="font-mono text-saffron-400">{criterion.language_signal}</span>
            </span>
          )}
        </div>
      )}

      {criterion.specificity_alert && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-saffron-500/10 border border-saffron-500/20 text-xs text-saffron-400">
          AI flagged this criterion as potentially restrictive
        </div>
      )}
    </div>
  );
}

export const CriterionCard = memo(CriterionCardInner);
