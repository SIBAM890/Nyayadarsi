/**
 * MilestoneCard — displays a single construction milestone with payment controls.
 */
import React, { memo } from 'react';
import { CheckCircle2, Clock, Lock, Unlock } from 'lucide-react';
import type { Milestone } from '@/types/builder';

interface MilestoneCardProps {
  milestone: Milestone;
  onTriggerPayment: (milestoneId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'border-verdict-green/15 bg-verdict-green/[0.03]',
  in_progress: 'border-verdict-yellow/15 bg-verdict-yellow/[0.03]',
  pending: '',
};

const STATUS_BADGE: Record<string, string> = {
  completed: 'badge-green',
  in_progress: 'badge-yellow',
  pending: 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/[0.04] text-nyaya-400 border border-white/[0.06]',
};

function MilestoneCardInner({ milestone, onTriggerPayment }: MilestoneCardProps) {
  const progressPct = milestone.target_percent > 0
    ? (milestone.current_percent / milestone.target_percent) * 100
    : 0;

  const progressColor = milestone.current_percent >= milestone.target_percent
    ? 'bg-verdict-green'
    : milestone.current_percent > 0
    ? 'bg-verdict-yellow'
    : 'bg-white/10';

  return (
    <div className={`glass-card p-5 ${STATUS_COLORS[milestone.status] || ''} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{milestone.title}</h4>
          <p className="text-xs text-nyaya-500 mt-0.5">{milestone.description}</p>
        </div>
        <span className={STATUS_BADGE[milestone.status] || STATUS_BADGE.pending}>
          {milestone.status?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-nyaya-500 mb-1">
          <span>Progress</span>
          <span>{milestone.current_percent}% / {milestone.target_percent}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div>
          <p className="text-[11px] text-nyaya-500">Payment</p>
          <p className="text-sm font-semibold text-white">₹{(milestone.payment_amount / 100000).toFixed(1)}L</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={milestone.payment_status === 'released' ? 'badge-green' : 'px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/[0.04] text-nyaya-400 border border-white/[0.06]'}>
            <span className="flex items-center gap-1">
              {milestone.payment_status === 'released' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {milestone.payment_status === 'released' ? 'RELEASED' : 'LOCKED'}
            </span>
          </span>
          {milestone.status === 'completed' && milestone.payment_status === 'locked' && (
            <button onClick={() => onTriggerPayment(milestone.id)} className="btn-primary text-xs py-1.5 px-3">
              Release Payment
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-nyaya-500">
        <span className={`flex items-center gap-1 ${milestone.ai_verified ? 'text-verdict-green' : ''}`}>
          {milestone.ai_verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {milestone.ai_verified ? 'AI Verified' : 'AI Pending'}
        </span>
        <span className={`flex items-center gap-1 ${milestone.officer_confirmed ? 'text-verdict-green' : ''}`}>
          {milestone.officer_confirmed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {milestone.officer_confirmed ? 'Officer Confirmed' : 'Officer Pending'}
        </span>
      </div>
    </div>
  );
}

export const MilestoneCard = memo(MilestoneCardInner);
