/**
 * ManualCheckForm — real-time criterion integrity check form.
 * Theme: Civic Light — Baby red + off-white + black text.
 */
import React, { useState, useCallback, memo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sanitizeText } from '@/utils/sanitize';
import type { IntegrityAlertResponse } from '@/types/tender';

interface ManualCheckFormProps {
  onCheck: (criterionText: string) => Promise<void>;
  alert: IntegrityAlertResponse | null;
  isChecking: boolean;
}

function ManualCheckFormInner({ onCheck, alert, isChecking }: ManualCheckFormProps) {
  const [criterion, setCriterion] = useState('');

  const handleCheck = useCallback(() => {
    const sanitized = sanitizeText(criterion.trim());
    if (sanitized) onCheck(sanitized);
  }, [criterion, onCheck]);

  return (
    <section
      className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <h3
        className="text-lg font-semibold text-[#1A1A1A] mb-1"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Manual Criterion Check
      </h3>
      <p className="text-sm text-[#5A5A5A] mb-4" style={{ lineHeight: '1.75' }}>
        Type a criterion to check for integrity alerts in real time
      </p>
      <div className="flex gap-3">
        <input
          value={criterion}
          onChange={(e) => setCriterion(e.target.value)}
          placeholder="e.g., Minimum annual turnover of Rs 50 Crore in last 2 years"
          className="flex-1 bg-[#FAF9F6] border border-[#E8E8E8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#D94040]/40 focus:ring-2 focus:ring-[#D94040]/10 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="px-5 py-2.5 bg-[#D94040] hover:bg-[#B03030] text-nyaya-100 rounded-lg text-sm font-semibold tracking-[0.02em] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </button>
      </div>
      {alert && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm flex items-start gap-2.5 transition-all duration-300 ${
            alert.alert
              ? 'bg-[#FEF2F2] border border-[#D94040]/20 text-[#B03030]'
              : 'bg-[#F0FDF4] border border-[#86EFAC]/40 text-[#166534]'
          }`}
        >
          {alert.alert ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-[#1A1A1A]">{alert.reason}</span>
            <span className="block text-xs mt-1.5 text-[#9A9A9A]">
              Estimated qualifying vendors: {alert.estimated_qualifying_vendors}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export const ManualCheckForm = memo(ManualCheckFormInner);
