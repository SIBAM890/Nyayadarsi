/**
 * ManualCheckForm — real-time criterion integrity check form.
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
    <section className="glass-card p-5">
      <h3 className="section-title mb-1">Manual Criterion Check</h3>
      <p className="section-subtitle mb-3">
        Type a criterion to check for integrity alerts in real time
      </p>
      <div className="flex gap-3">
        <input
          value={criterion}
          onChange={(e) => setCriterion(e.target.value)}
          placeholder="e.g., Minimum annual turnover of Rs 50 Crore in last 2 years"
          className="input-field flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="btn-primary whitespace-nowrap"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </button>
      </div>
      {alert && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm animate-slide-up flex items-start gap-2.5 ${
            alert.alert
              ? 'bg-verdict-red/10 border border-verdict-red/15 text-red-300'
              : 'bg-verdict-green/10 border border-verdict-green/15 text-verdict-green'
          }`}
        >
          {alert.alert ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <span>{alert.reason}</span>
            <span className="block text-xs mt-1 opacity-60">
              Estimated qualifying vendors: {alert.estimated_qualifying_vendors}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export const ManualCheckForm = memo(ManualCheckFormInner);
