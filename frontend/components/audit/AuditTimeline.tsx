import React, { memo, useState } from 'react';
import type { AuditTrailResponse, AuditEntry } from '@/types/audit';
import { Fingerprint, CheckCircle2, ShieldAlert, Cpu, User, Copy, Check } from 'lucide-react';

interface AuditTimelineProps {
  data: AuditTrailResponse | null;
}

function getActionIcon(action: string) {
  if (action.includes('EVALUATION_COMPLETE')) return <Cpu className="w-5 h-5 text-nyaya-400" />;
  if (action.includes('OFFICER_DECISION')) return <User className="w-5 h-5 text-verdict-green" />;
  if (action.includes('COLLUSION_DETECTED')) return <ShieldAlert className="w-5 h-5 text-verdict-red" />;
  return <CheckCircle2 className="w-5 h-5 text-nyaya-500" />;
}

function HashDisplay({ label, hash }: { label: string, hash: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-start group cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-semibold mt-0.5">{label}</span>
        <div className="flex items-start gap-2 max-w-[70%]">
          <span className={`text-[10px] font-mono text-theme-text-muted transition-colors ${expanded ? 'break-all' : 'truncate max-w-[250px]'}`}>
            {hash}
          </span>
          <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-theme-bg-active rounded text-theme-brand mt-0.5" title="Copy to clipboard">
            {copied ? <Check className="w-3 h-3 text-theme-status-green-text" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
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
    <div className="relative ml-2 space-y-8 py-4">
      {/* Continuous vertical line connector */}
      <div className="absolute top-8 bottom-0 left-[21px] w-px bg-[#E8E8E8]" />

      {data.trail.map((entry, index) => (
        <div key={entry.id} className="relative pl-12">
          {/* Circle icon on the timeline */}
          <div className="absolute left-[21px] top-6 -translate-x-1/2 bg-theme-bg-card border border-theme-border rounded-full p-1.5 z-10 shadow-sm">
            {getActionIcon(entry.action)}
          </div>
          
          <div className="glass-card p-5 border border-theme-border hover:border-theme-brand/30 transition-colors shadow-sm bg-theme-bg-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-nyaya-100 tracking-wide capitalize">
                {entry.action.replace(/_/g, ' ').toLowerCase()}
              </h4>
              <time className="text-xs text-nyaya-400 font-mono font-medium">
                {new Date(entry.timestamp + 'Z').toLocaleString()}
              </time>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-theme-text-muted font-semibold block mb-1">Entity Reference</span>
                <span className="text-xs font-mono bg-theme-bg-footer px-2 py-1 rounded text-theme-text-body">
                  {entry.entity_type.toLowerCase()} :: {entry.entity_id}
                </span>
              </div>
              {entry.officer_id && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-theme-text-muted font-semibold block mb-1">Authorizing Officer</span>
                  <span className="text-xs text-theme-text-body bg-theme-bg-footer px-2 py-1 rounded">{entry.officer_id}</span>
                </div>
              )}
              {entry.verdict && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-theme-text-muted font-semibold block mb-1">Verdict Applied</span>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    entry.verdict === 'GREEN' ? 'bg-verdict-green/10 text-verdict-green' :
                    entry.verdict === 'RED' ? 'bg-verdict-red/10 text-verdict-red' :
                    'bg-verdict-yellow/10 text-verdict-yellow'
                  }`}>
                    {entry.verdict}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-surface-1 rounded-lg p-4 border border-[#E8E8E8]">
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-3.5 h-3.5 text-nyaya-400" />
                <span className="text-xs font-medium text-nyaya-200">Cryptographic Verification</span>
              </div>
              <div className="space-y-3">
                <HashDisplay label="Input SHA-256" hash={entry.sha256_input} />
                <HashDisplay label="State SHA-256" hash={entry.sha256_output} />
              </div>
            </div>
            
          </div>
        </div>
      ))}
      
      {/* Downward line and "Load earlier entries" */}
      <div className="relative pl-12 pt-2">
        <div className="absolute left-[21px] top-0 bottom-0 w-px bg-gradient-to-b from-[#E8E8E8] to-transparent -translate-x-1/2" />
        <button className="text-[11px] text-nyaya-400 hover:text-nyaya-500 font-medium transition-colors bg-surface-0 px-4 py-1.5 border border-[#E8E8E8] rounded-full shadow-sm relative z-10 uppercase tracking-widest">
          Load earlier entries
        </button>
      </div>
    </div>
  );
}

export const AuditTimeline = memo(AuditTimelineInner);
