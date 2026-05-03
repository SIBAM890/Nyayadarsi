/**
 * CollusionPanel — slide-in panel showing collusion risk analysis results.
 */
import React, { memo } from 'react';
import { X, BarChart3, Fingerprint, MapPin, Network, FileWarning, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
    <div className="w-full bg-surface-1 h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-display font-semibold">Collusion Risk Analysis</h3>
        {/* We moved the close button to the parent component */}
      </div>
      <div className="text-sm text-nyaya-400 mb-4">
        {data.total_triggered} of {data.flags?.length || 0} flags triggered
      </div>
      <div className="space-y-4">
        {data.flags?.map((flag) => {
          const flagName = flag.flag as CollusionFlagName;
          const labelInfo = FLAG_LABELS[flagName];
          const icon = FLAG_ICON_MAP[flagName] || <Search className="w-4 h-4" />;
          const isClustering = flagName === 'BID_CLUSTERING';
          
          return (
            <div key={flag.flag} className={`glass-card p-4 ${flag.triggered ? 'border-verdict-red/20 bg-verdict-red/[0.03]' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-nyaya-400">{icon}</span>
                  <span className="text-sm font-medium">{labelInfo?.label || flag.flag}</span>
                </div>
                {flag.triggered ? <span className="badge-red">TRIGGERED</span> : <span className="badge-green">CLEAR</span>}
              </div>

              {isClustering && flag.evidence?.bids && flag.evidence.bids.length > 0 && (
                <div className="h-32 w-full mt-4 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flag.evidence.bids} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="bidder" hide />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0f1555', borderColor: '#4338ca', color: '#fff', fontSize: '12px' }}
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Bid Amount']}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {flag.evidence.bids.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={flag.triggered ? '#ef5350' : '#4f46e5'} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {flag.cv_percent != null && (
                <div className="mb-4 bg-surface-0/50 p-3 rounded-lg border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-nyaya-400">Coefficient of Variation</span>
                      <span className="text-sm font-semibold">{flag.cv_percent}% <span className="text-nyaya-500 text-xs font-normal">(Threshold 5%)</span></span>
                    </div>
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/[0.06]" />
                        <circle
                          cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(flag.cv_percent, 10) / 10)}
                          className={`transition-all duration-1000 ease-out ${flag.cv_percent < 5 ? 'text-verdict-red' : 'text-verdict-green'}`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {flag.similarity_score != null && (
                <div className="mb-4 bg-surface-0/50 p-3 rounded-lg border border-white/[0.04] flex justify-between items-center">
                  <span className="text-xs text-nyaya-400">Formatting Similarity</span>
                  <span className="font-semibold text-sm text-verdict-red">{Math.round(flag.similarity_score * 100)}%</span>
                </div>
              )}

              {flag.evidence?.interpretation && (
                <p className="text-sm text-nyaya-300 mt-2 leading-relaxed bg-surface-2 p-3 rounded-md border-l-2 border-nyaya-500">
                  {flag.evidence.interpretation}
                </p>
              )}

              {flag.evidence?.matching_features && flag.evidence.matching_features.length > 0 && (
                <div className="mt-3 space-y-1.5 bg-surface-0 p-3 rounded-md">
                  <p className="text-xs font-medium text-nyaya-400 mb-2">Identified Similarities:</p>
                  {flag.evidence.matching_features.map((f, i) => (
                    <p key={i} className="text-xs text-nyaya-300 flex items-start gap-2">
                      <span className="text-nyaya-500 mt-0.5">•</span>
                      {f}
                    </p>
                  ))}
                </div>
              )}
              
              {flag.reason && <p className="text-xs text-nyaya-500 mt-3 italic">{flag.reason}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CollusionPanel = memo(CollusionPanelInner);
