/**
 * CollusionPanel — slide-in panel showing collusion risk analysis results.
 */
import React, { memo } from 'react';
import { X, BarChart3, Fingerprint, MapPin, Network, FileWarning, Search } from 'lucide-react';
import type { CollusionReportResponse, CollusionFlagName } from '@/types/collusion';
import { FLAG_LABELS } from '@/constants';

interface CollusionPanelProps {
  data: CollusionReportResponse;
  onClose: () => void;
}

const FLAG_ICON_MAP: Record<CollusionFlagName, React.ReactNode> = {
  BID_CLUSTERING: <BarChart3 className="w-4 h-4" />,
  CA_FINGERPRINT: <Fingerprint className="w-4 h-4" />,
  SHARED_ADDRESS: <MapPin className="w-4 h-4" />,
  OWNERSHIP_NETWORK: <Network className="w-4 h-4" />,
  DOC_QUALITY_ASYMMETRY: <FileWarning className="w-4 h-4" />,
};

function CollusionPanelInner({ data, onClose }: CollusionPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div className="w-[480px] bg-surface-1 border-l border-white/[0.06] overflow-y-auto p-6 animate-slide-right">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-display font-semibold">Collusion Risk Analysis</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors" aria-label="Close panel">
            <X className="w-4 h-4 text-nyaya-400" />
          </button>
        </div>
        <div className="text-sm text-nyaya-400 mb-4">
          {data.total_triggered} of {data.flags?.length || 0} flags triggered
        </div>
        <div className="space-y-3">
          {data.flags?.map((flag) => {
            const flagName = flag.flag as CollusionFlagName;
            const labelInfo = FLAG_LABELS[flagName];
            const icon = FLAG_ICON_MAP[flagName] || <Search className="w-4 h-4" />;
            return (
              <div key={flag.flag} className={`glass-card p-4 ${flag.triggered ? 'border-verdict-red/20 bg-verdict-red/[0.03]' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-nyaya-400">{icon}</span>
                    <span className="text-sm font-medium">{labelInfo?.label || flag.flag}</span>
                  </div>
                  {flag.triggered ? <span className="badge-red">TRIGGERED</span> : <span className="badge-green">CLEAR</span>}
                </div>
                {flag.cv_percent != null && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-nyaya-500 mb-1">
                      <span>CV: {flag.cv_percent}%</span>
                      <span>Threshold: 5%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${flag.cv_percent < 5 ? 'bg-verdict-red' : 'bg-verdict-green'}`}
                        style={{ width: `${Math.min(100, (flag.cv_percent / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {flag.similarity_score != null && (
                  <p className="text-xs text-nyaya-300">Similarity: <span className="font-semibold text-verdict-red">{Math.round(flag.similarity_score * 100)}%</span></p>
                )}
                {flag.evidence?.interpretation && (
                  <p className="text-xs text-nyaya-500 mt-2 leading-relaxed">{flag.evidence.interpretation}</p>
                )}
                {flag.evidence?.matching_features && flag.evidence.matching_features.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {flag.evidence.matching_features.map((f, i) => (
                      <p key={i} className="text-xs text-nyaya-500 ml-3">• {f}</p>
                    ))}
                  </div>
                )}
                {flag.reason && <p className="text-xs text-nyaya-500 mt-2 italic">{flag.reason}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const CollusionPanel = memo(CollusionPanelInner);
