/**
 * YellowItem — a single yellow-queue item requiring officer decision.
 */
import React, { useState, useCallback, memo } from 'react';
import { CheckCircle2, FileText, Check, X } from 'lucide-react';
import type { YellowQueueItem, OfficerDecisionResponse } from '@/types/evaluation';
import { postOfficerDecision } from '@/services/evaluationService';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { sanitizeText } from '@/utils/sanitize';
import { TENDER_ID } from '@/constants';

interface YellowItemProps {
  item: YellowQueueItem;
  officerId: string;
  onDecision?: (response: OfficerDecisionResponse) => void;
}

function YellowItemInner({ item, officerId, onDecision }: YellowItemProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decided, setDecided] = useState(false);

  const handleDecision = useCallback(
    async (decision: 'PASS' | 'FAIL') => {
      if (reason.length < 10) return;
      setSubmitting(true);
      const { data } = await postOfficerDecision({
        tender_id: TENDER_ID,
        bidder_id: item.bidder_id,
        criterion_id: item.criterion_id,
        decision,
        reason: sanitizeText(reason),
        officer_id: officerId,
      });
      setSubmitting(false);
      if (data) {
        setDecided(true);
        onDecision?.(data);
      }
    },
    [reason, item.bidder_id, item.criterion_id, officerId, onDecision]
  );

  if (decided) {
    return (
      <div className="glass-card p-4 border-verdict-green/15 bg-verdict-green/[0.03] animate-slide-up">
        <div className="flex items-center gap-2 text-verdict-green text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Decision recorded and logged to audit trail
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 border-verdict-yellow/15 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <VerdictBadge verdict="YELLOW" />
            {item.blocker ? (
              <span className="text-[10px] font-black tracking-widest uppercase bg-verdict-red text-white px-2 py-0.5 rounded shadow-sm">BLOCKER</span>
            ) : item.mandatory ? (
              <span className="badge-red text-[10px]">MANDATORY</span>
            ) : null}
          </div>
          <p className="text-sm font-medium text-nyaya-100">{item.company_name}</p>
          <p className="text-xs text-nyaya-500 mt-0.5">
            {item.criterion_id} — {item.criterion || item.flag_reason}
          </p>
        </div>
        {item.confidence != null && (
          <div className="text-right">
            <p className="text-[11px] text-nyaya-500">Confidence</p>
            <p className="text-lg font-semibold text-verdict-yellow">
              {Math.round(item.confidence * 100)}%
            </p>
          </div>
        )}
      </div>

      {item.ambiguity && (
        <div className="px-3 py-2 rounded-lg bg-verdict-yellow/10 border border-verdict-yellow/15 text-xs text-verdict-yellow/80 leading-relaxed">
          {item.ambiguity}
        </div>
      )}

      {item.source_document && (
        <p className="text-xs text-nyaya-500 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          {item.source_document}
          {item.source_page ? `, Page ${item.source_page}` : ''}
        </p>
      )}

      {item.officer_options && (
        <div className="text-xs text-nyaya-500 space-y-1">
          <p className="font-medium text-nyaya-400">Options:</p>
          {item.officer_options.map((opt, i) => (
            <p key={i} className="ml-3">• {opt}</p>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mandatory: Document your reasoning (min 10 characters)..."
          className="input-field text-xs h-16 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleDecision('PASS')}
            disabled={reason.length < 10 || submitting}
            className="px-3 py-1.5 bg-verdict-green/15 hover:bg-verdict-green/25 text-verdict-green rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            {submitting ? '...' : 'PASS'}
          </button>
          <button
            onClick={() => handleDecision('FAIL')}
            disabled={reason.length < 10 || submitting}
            className="px-3 py-1.5 bg-verdict-red/15 hover:bg-verdict-red/25 text-verdict-red rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {submitting ? '...' : 'FAIL'}
          </button>
        </div>
        {reason.length > 0 && reason.length < 10 && (
          <p className="text-[10px] text-red-400/60">
            {10 - reason.length} more characters required
          </p>
        )}
      </div>
    </div>
  );
}

export const YellowItem = memo(YellowItemInner);
