/**
 * CriterionCard — displays a single extracted tender criterion.
 * Theme: Civic Light — Baby red + off-white + black text.
 */
import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TenderCriterion } from '@/types/tender';

interface CriterionCardProps {
  criterion: TenderCriterion;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  financial: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
  technical: 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
  compliance: 'bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]',
};

function CriterionCardInner({ criterion, index }: CriterionCardProps) {
  const colors = TYPE_COLORS[criterion.type] || TYPE_COLORS.compliance;

  return (
    <div
      className="bg-white border border-[#E8E8E8] rounded-xl p-5 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
      style={{
        animationDelay: `${index * 0.06}s`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase border tracking-[0.06em] ${colors}`}
          >
            {criterion.type}
          </span>
          {criterion.mandatory ? (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] bg-[#F5E6E6] text-[#D94040] border border-[#D94040]/20">
              MANDATORY
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-[0.06em] bg-[#F5F0E8] text-[#5A5A5A] border border-[#E8E8E8]">
              DISCRETIONARY
            </span>
          )}
          {criterion.blocker && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] bg-[#D94040]/10 text-[#B03030] border border-[#D94040]/20">
              BLOCKER
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#9A9A9A] font-mono">{criterion.criterion_id}</span>
      </div>

      <p
        className="text-sm text-[#1A1A1A] leading-relaxed mb-3"
        style={{ lineHeight: '1.75' }}
      >
        {criterion.description}
      </p>

      {criterion.threshold !== null && criterion.threshold !== undefined && (
        <div className="flex items-center gap-4 text-xs text-[#5A5A5A]">
          <span>
            Threshold:{' '}
            <span className="text-[#1A1A1A] font-semibold">
              {criterion.threshold_unit === 'INR'
                ? `₹${(criterion.threshold / 10000000).toFixed(1)} Cr`
                : criterion.threshold}
            </span>{' '}
            {criterion.threshold_unit !== 'INR' ? criterion.threshold_unit : ''}
          </span>
          {criterion.language_signal && (
            <span>
              Signal: <span className="font-mono text-[#D94040]">{criterion.language_signal}</span>
            </span>
          )}
        </div>
      )}

      {criterion.specificity_alert && (
        <div className="mt-3 px-3 py-2.5 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] text-xs text-[#E65100] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          AI flagged this criterion as potentially restrictive
        </div>
      )}
    </div>
  );
}

export const CriterionCard = memo(CriterionCardInner);
