import React, { memo } from 'react';
import type { AuditTrailResponse, AuditEntry } from '@/types/audit';
import { Fingerprint, CheckCircle2, ShieldAlert, Cpu, User } from 'lucide-react';

interface AuditTimelineProps {
  data: AuditTrailResponse | null;
}

function getActionIcon(action: string) {
  if (action.includes('EVALUATION_COMPLETE')) return <Cpu className="w-5 h-5 text-nyaya-400" />;
  if (action.includes('OFFICER_DECISION')) return <User className="w-5 h-5 text-verdict-green" />;
  if (action.includes('COLLUSION_DETECTED')) return <ShieldAlert className="w-5 h-5 text-verdict-red" />;
  return <CheckCircle2 className="w-5 h-5 text-nyaya-500" />;
}

function AuditTimelineInner({ data }: AuditTimelineProps) {
  if (!data || !data.trail || data.trail.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-nyaya-400">
        No cryptographic audit records found.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-white/[0.06] ml-4 space-y-8 py-4">
      {data.trail.map((entry, index) => (
        <div key={entry.id} className="relative pl-8">
          <div className="absolute -left-[11px] bg-surface-0 border-2 border-surface-1 rounded-full p-1">
            {getActionIcon(entry.action)}
          </div>
          
          <div className="glass-card p-5 border-l-2 border-l-nyaya-600/50 hover:border-l-nyaya-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                {entry.action.replace(/_/g, ' ')}
              </h4>
              <time className="text-xs text-nyaya-500 font-mono">
                {new Date(entry.timestamp + 'Z').toLocaleString()}
              </time>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-nyaya-500 block mb-1">Entity Reference</span>
                <span className="text-xs font-mono bg-white/[0.04] px-2 py-1 rounded text-nyaya-300">
                  {entry.entity_type} :: {entry.entity_id}
                </span>
              </div>
              {entry.officer_id && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-nyaya-500 block mb-1">Authorizing Officer</span>
                  <span className="text-xs text-nyaya-300 bg-white/[0.04] px-2 py-1 rounded">{entry.officer_id}</span>
                </div>
              )}
              {entry.verdict && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-nyaya-500 block mb-1">Verdict Applied</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    entry.verdict === 'GREEN' ? 'bg-verdict-green/10 text-verdict-green' :
                    entry.verdict === 'RED' ? 'bg-verdict-red/10 text-verdict-red' :
                    'bg-verdict-yellow/10 text-verdict-yellow'
                  }`}>
                    {entry.verdict}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-surface-0/50 rounded-lg p-3 border border-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-3 h-3 text-nyaya-500" />
                <span className="text-[10px] uppercase tracking-wider text-nyaya-400">Cryptographic Verification</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] text-nyaya-600">INPUT SHA-256</span>
                  <span className="text-[10px] font-mono text-nyaya-400/70 truncate max-w-[250px]" title={entry.sha256_input}>
                    {entry.sha256_input}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] text-nyaya-600">STATE SHA-256</span>
                  <span className="text-[10px] font-mono text-nyaya-400/70 truncate max-w-[250px]" title={entry.sha256_output}>
                    {entry.sha256_output}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
}

export const AuditTimeline = memo(AuditTimelineInner);
