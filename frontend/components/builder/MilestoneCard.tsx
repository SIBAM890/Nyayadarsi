/**
 * MilestoneCard — displays a single construction milestone with payment controls.
 */
import React, { memo } from 'react';
import type { Milestone } from '@/types/builder';

interface MilestoneCardProps {
  milestone: Milestone;
  onTriggerPayment: (milestoneId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'border-verdict-green/30 bg-verdict-green/5',
  in_progress: 'border-verdict-yellow/30 bg-verdict-yellow/5',
  pending: 'border-white/5',
};

const STATUS_BADGE: Record<string, string> = {
  completed: 'badge-green',
  in_progress: 'badge-yellow',
  pending: 'px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-nyaya-400/50 border border-white/10',
};

function MilestoneCardInner({ milestone, onTriggerPayment }: MilestoneCardProps) {
  const progressPct = milestone.target_percent > 0
    ? (milestone.current_percent / milestone.target_percent) * 100
    : 0;

  const progressColor = milestone.current_percent >= milestone.target_percent
    ? 'bg-verdict-green'
    : milestone.current_percent > 0
    ? 'bg-gradient-to-r from-verdict-yellow to-saffron-400'
    : 'bg-white/10';

  return (
    <div className={`glass-card p-5 ${STATUS_COLORS[milestone.status] || ''} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
          <p className="text-xs text-nyaya-400/50 mt-0.5">{milestone.description}</p>
        </div>
        <span className={STATUS_BADGE[milestone.status] || STATUS_BADGE.pending}>
          {milestone.status?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-nyaya-400/50 mb-1">
          <span>Progress</span>
          <span>{milestone.current_percent}% / {milestone.target_percent}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-nyaya-400/40">Payment</p>
          <p className="text-sm font-bold text-white">₹{(milestone.payment_amount / 100000).toFixed(1)}L</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={milestone.payment_status === 'released' ? 'badge-green' : 'px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-nyaya-400/50 border border-white/10'}>
            {milestone.payment_status === 'released' ? '💰 RELEASED' : '🔒 LOCKED'}
          </span>
          {milestone.status === 'completed' && milestone.payment_status === 'locked' && (
            <button onClick={() => onTriggerPayment(milestone.id)} className="btn-primary text-xs py-2 px-3">
              Release Payment
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-nyaya-400/40">
        <span className={milestone.ai_verified ? 'text-verdict-green' : ''}>
          {milestone.ai_verified ? '✅ AI Verified' : '⏳ AI Pending'}
        </span>
        <span className={milestone.officer_confirmed ? 'text-verdict-green' : ''}>
          {milestone.officer_confirmed ? '✅ Officer Confirmed' : '⏳ Officer Pending'}
        </span>
      </div>
    </div>
  );
}

export const MilestoneCard = memo(MilestoneCardInner);
