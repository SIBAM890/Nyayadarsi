/**
 * IntegrityAlert — displays an AI integrity alert with revise/override actions.
 * Theme: Civic Light — Baby red + off-white + black text.
 */
import React, { useState, memo, useCallback } from 'react';
import { AlertOctagon } from 'lucide-react';
import type { IntegrityAlertResponse } from '@/types/tender';
import { sanitizeText } from '@/utils/sanitize';

interface IntegrityAlertProps {
  alert: IntegrityAlertResponse;
  onRevise: () => void;
  onOverride: (justification: string) => void;
}

function IntegrityAlertInner({ alert, onRevise, onOverride }: IntegrityAlertProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [justification, setJustification] = useState('');

  const handleConfirmOverride = useCallback(() => {
    if (justification.length >= 10) {
      onOverride(sanitizeText(justification));
    }
  }, [justification, onOverride]);

  return (
    <div
      className="border border-[#D94040]/25 bg-[#FEF2F2] rounded-xl p-6 transition-all duration-300"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#D94040]/15 flex items-center justify-center text-[#D94040] flex-shrink-0">
          <AlertOctagon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <h4
            className="text-sm font-semibold text-[#B03030] mb-1"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Nyayadarsi Integrity Alert
          </h4>
          <p className="text-xs text-[#5A5A5A] leading-relaxed">{alert.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#9A9A9A] mb-5 pl-12">
        <span>Estimated qualifying vendors: </span>
        <span className="font-semibold text-[#D94040]">{alert.estimated_qualifying_vendors}</span>
      </div>

      {!showOverride ? (
        <div className="flex gap-3 pl-12">
          <button
            onClick={onRevise}
            className="px-4 py-2 bg-[#F5F0E8] hover:bg-[#EDE5D5] text-[#1A1A1A] rounded-lg text-xs font-semibold tracking-[0.02em] transition-colors border border-[#E8E8E8]"
          >
            Revise Criterion
          </button>
          <button
            onClick={() => setShowOverride(true)}
            className="px-4 py-2 bg-[#D94040]/10 hover:bg-[#D94040]/20 text-[#B03030] rounded-lg text-xs font-semibold tracking-[0.02em] transition-colors border border-[#D94040]/20"
          >
            Override with Justification
          </button>
        </div>
      ) : (
        <div className="space-y-3 pl-12">
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Provide mandatory justification for overriding this alert..."
            className="w-full text-xs h-20 resize-none bg-white border border-[#E8E8E8] rounded-lg p-3 text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#D94040]/40 focus:ring-2 focus:ring-[#D94040]/10 transition-all"
          />
          <div className="flex gap-3">
            <button
              onClick={handleConfirmOverride}
              disabled={justification.length < 10}
              className="px-4 py-2 bg-[#D94040] hover:bg-[#B03030] text-nyaya-100 rounded-lg text-xs font-semibold tracking-[0.02em] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Confirm Override
            </button>
            <button
              onClick={() => setShowOverride(false)}
              className="px-4 py-2 text-[#5A5A5A] hover:text-[#1A1A1A] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const IntegrityAlert = memo(IntegrityAlertInner);
