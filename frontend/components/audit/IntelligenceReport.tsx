import React from 'react';
import { 
  FileText, ShieldCheck, AlertTriangle, Info, 
  ChevronRight, Bookmark, Scale 
} from 'lucide-react';

interface IntelligenceReportProps {
  content: string;
}

/**
 * IntelligenceReport — A high-fidelity, advisory-style renderer for AI forensic reports.
 * Focuses on professional typography, clean whitespace, and an executive briefing aesthetic.
 */
export const IntelligenceReport: React.FC<IntelligenceReportProps> = ({ content }) => {
  if (!content) return null;

  // Split into sections based on headers or horizontal rules
  const sections = content.split(/(?=###? )|---/g).filter(s => s.trim().length > 0);

  return (
    <div className="space-y-10 animate-fade-in font-sans pb-20 max-w-3xl mx-auto">
      {sections.map((section, idx) => {
        const trimmed = section.trim();
        
        // Handle Horizontal Rules
        if (section.includes('---')) {
          return <div key={idx} className="border-t border-theme-border/40 my-8" />;
        }

        // Handle Main Title (##)
        if (trimmed.startsWith('##')) {
          return (
            <div key={idx} className="mb-6 pt-4">
              <h2 className="text-xl font-display font-semibold text-theme-text-heading tracking-tight border-l-4 border-theme-brand pl-4">
                {trimmed.replace(/^##+\s*/, '')}
              </h2>
            </div>
          );
        }

        // Handle Sub-headers (###)
        if (trimmed.startsWith('###')) {
          const lines = trimmed.split('\n');
          const title = lines[0].replace(/^###+\s*/, '');
          const body = lines.slice(1).join('\n');
          
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-brand/60">
                  {title}
                </h3>
                <div className="h-px bg-theme-border/30 flex-1" />
              </div>
              <div className="pl-0 space-y-4 text-theme-text-body">
                {renderContent(body)}
              </div>
            </div>
          );
        }

        // Default content block
        return <div key={idx} className="text-sm leading-relaxed text-theme-text-body">{renderContent(trimmed)}</div>;
      })}
    </div>
  );
};

/**
 * Basic content renderer for bold text, lists, and specific callouts.
 */
function renderContent(text: string) {
  const lines = text.split('\n').filter(l => l.trim() !== '');

  return lines.map((line, i) => {
    const trimmed = line.trim();

    // Check for "Issue:" or "Risk:" callouts - Professional Advisory
    if (trimmed.includes('**Issue:**') || trimmed.includes('**Red Flag**') || trimmed.includes('**Potential Compliance Issues**')) {
      return (
        <div key={i} className="my-8 p-8 bg-theme-bg-footer/20 border border-theme-border/60 rounded-xl relative shadow-sm">
          <div className="absolute -top-3 left-8 px-3 py-0.5 bg-white border border-theme-border/60 rounded-full text-[9px] font-black uppercase tracking-widest text-theme-brand flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Advisory Note
          </div>
          <div className="text-sm text-theme-text-body leading-relaxed">
            {formatBold(trimmed)}
          </div>
        </div>
      );
    }

    // GFR References
    if (trimmed.includes('GFR Reference:')) {
      return (
        <div key={i} className="my-4 flex gap-3 items-center px-4 py-2 bg-theme-brand/5 rounded-lg border border-theme-brand/10">
          <Scale className="w-3.5 h-3.5 text-theme-brand shrink-0" />
          <p className="text-[11px] font-semibold text-theme-brand/80 leading-none uppercase tracking-wider">{formatBold(trimmed)}</p>
        </div>
      );
    }

    // List items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('*')) {
      return (
        <div key={i} className="flex gap-3 ml-1 py-1.5 items-start">
          <ChevronRight className="w-3.5 h-3.5 text-theme-brand/40 mt-1 shrink-0" />
          <p className="text-sm text-theme-text-body leading-relaxed">{formatBold(trimmed.replace(/^[*-\s]+/, ''))}</p>
        </div>
      );
    }

    // Numbered lists - Clean and minimal
    if (/^\d+\./.test(trimmed)) {
      const [num, ...rest] = trimmed.split('.');
      return (
        <div key={i} className="flex gap-4 py-2 border-b border-theme-border/10 last:border-0">
          <span className="text-sm font-black font-mono text-theme-brand/30">{num.padStart(2, '0')}</span>
          <p className="text-sm text-theme-text-body leading-relaxed">{formatBold(rest.join('.'))}</p>
        </div>
      );
    }

    return <p key={i} className="text-sm text-theme-text-body leading-relaxed py-2">{formatBold(trimmed)}</p>;
  });
}

/**
 * Minimal bold text formatter (**text**)
 */
function formatBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-theme-text-heading">{part.slice(2, -2)}</strong>;
    }
    return part.replace(/[#*]{2,}/g, '');
  });
}
