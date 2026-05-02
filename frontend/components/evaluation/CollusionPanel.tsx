/**
 * CollusionPanel — slide-in panel showing collusion risk analysis results.
 */
import React, { memo } from 'react';
import type { CollusionReportResponse, CollusionFlagName } from '@/types/collusion';
import { FLAG_LABELS, FLAG_ICONS } from '@/constants';

interface CollusionPanelProps {
  data: CollusionReportResponse;
  onClose: () => void;
}

function CollusionPanelInner({ data, onClose }: CollusionPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div className="w-[500px] bg-nyaya-950 border-l border-white/10 overflow-y-auto p-6 animate-slide-right">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold">Collusion Risk Analysis</h3>
          <button onClick={onClose} className="btn-ghost text-xs" aria-label="Close panel">✕ Close</button>
        </div>
        <div className="text-sm text-nyaya-300/60 mb-4">
          {data.total_triggered} of {data.flags?.length || 0} flags triggered
        </div>
        <div className="space-y-4">
          {data.flags?.map((flag) => {
            const flagName = flag.flag as CollusionFlagName;
            const labelInfo = FLAG_LABELS[flagName];
            const icon = FLAG_ICONS[flagName] || '🔍';
            return (
              <div key={flag.flag} className={`glass-card p-4 ${flag.triggered ? 'border-verdict-red/30 bg-verdict-red/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-sm font-medium">{labelInfo?.label || flag.flag}</span>
                  </div>
                  {flag.triggered ? <span className="badge-red">TRIGGERED</span> : <span className="badge-green">CLEAR</span>}
                </div>
                {flag.cv_percent != null && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-nyaya-400/50 mb-1">
                      <span>CV: {flag.cv_percent}%</span>
                      <span>Threshold: 5%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${flag.cv_percent < 5 ? 'bg-verdict-red' : 'bg-verdict-green'}`}
                        style={{ width: `${Math.min(100, (flag.cv_percent / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {flag.similarity_score != null && (
                  <p className="text-xs text-nyaya-300/60">Similarity: <span className="font-bold text-verdict-red">{Math.round(flag.similarity_score * 100)}%</span></p>
                )}
                {flag.evidence?.interpretation && (
                  <p className="text-xs text-nyaya-400/50 mt-2 leading-relaxed">{flag.evidence.interpretation}</p>
                )}
                {flag.evidence?.matching_features && flag.evidence.matching_features.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {flag.evidence.matching_features.map((f, i) => (
                      <p key={i} className="text-xs text-nyaya-400/40 ml-3">• {f}</p>
                    ))}
                  </div>
                )}
                {flag.reason && <p className="text-xs text-nyaya-400/40 mt-2 italic">{flag.reason}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const CollusionPanel = memo(CollusionPanelInner);
