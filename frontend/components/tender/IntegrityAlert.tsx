/**
 * IntegrityAlert — displays an AI integrity alert with revise/override actions.
 */
import React, { useState, memo, useCallback } from 'react';
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
    <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-5 animate-slide-up">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
          🚨
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-400 mb-1">Nyayadarsi Integrity Alert</h4>
          <p className="text-xs text-red-300/70 leading-relaxed">{alert.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-red-300/50 mb-4">
        <span>Estimated qualifying vendors: </span>
        <span className="font-bold text-red-400">{alert.estimated_qualifying_vendors}</span>
      </div>

      {!showOverride ? (
        <div className="flex gap-3">
          <button
            onClick={onRevise}
            className="px-4 py-2 bg-nyaya-600/20 hover:bg-nyaya-600/30 text-nyaya-300 rounded-lg text-xs font-medium transition-colors"
          >
            Revise Criterion
          </button>
          <button
            onClick={() => setShowOverride(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
          >
            Override with Justification
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Provide mandatory justification for overriding this alert..."
            className="input-field text-xs h-20 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleConfirmOverride}
              disabled={justification.length < 10}
              className="px-4 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
            >
              Confirm Override
            </button>
            <button
              onClick={() => setShowOverride(false)}
              className="btn-ghost text-xs"
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
