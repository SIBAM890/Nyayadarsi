import React from 'react';
import { 
  FileText, ShieldCheck, AlertTriangle, Info, 
  ChevronRight, Bookmark, Scale 
} from 'lucide-react';

interface IntelligenceReportProps {
  content: string;
}

/**
 * IntelligenceReport — A custom, lightweight renderer for AI-generated 
 * procurement analysis. Designed to look like a professional legal/audit document.
 */
export const IntelligenceReport: React.FC<IntelligenceReportProps> = ({ content }) => {
  if (!content) return null;

  // Split into sections based on headers or horizontal rules
  const sections = content.split(/(?=###? )|---/g).filter(s => s.trim().length > 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {sections.map((section, idx) => {
        const trimmed = section.trim();
        
        // Handle Horizontal Rules
        if (section.includes('---')) {
          return <div key={idx} className="border-t border-theme-border my-8" />;
        }

        // Handle Main Title (##)
        if (trimmed.startsWith('## ')) {
          return (
            <div key={idx} className="pb-4 border-b-2 border-theme-brand/20">
              <h2 className="text-xl font-display font-bold text-theme-text-heading tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-theme-brand" />
                {trimmed.replace('## ', '')}
              </h2>
            </div>
          );
        }

        // Handle Sub-headers (###)
        if (trimmed.startsWith('### ')) {
          const title = trimmed.split('\n')[0].replace('### ', '');
          const body = trimmed.split('\n').slice(1).join('\n');
          
          return (
            <div key={idx} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-theme-brand flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-brand" />
                {title}
              </h3>
              <div className="pl-3 border-l-2 border-theme-bg-active space-y-4">
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

    // Check for "Issue:" or "Risk:" callouts
    if (trimmed.includes('**Issue:**') || trimmed.includes('**Potential Compliance Issues**')) {
      return (
        <div key={i} className="my-3 p-4 bg-verdict-yellow/5 border-l-4 border-verdict-yellow rounded-r-lg">
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-verdict-yellow shrink-0 mt-0.5" />
            <p className="text-sm text-nyaya-100 italic">{formatBold(trimmed)}</p>
          </div>
        </div>
      );
    }

    // Check for GFR References
    if (trimmed.includes('GFR Reference:')) {
      return (
        <div key={i} className="my-2 p-3 bg-nyaya-600/5 border border-nyaya-600/20 rounded-lg flex gap-3 items-start">
          <Scale className="w-4 h-4 text-nyaya-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-nyaya-300">{formatBold(trimmed)}</p>
        </div>
      );
    }

    // List items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 ml-2 py-0.5">
          <ChevronRight className="w-3.5 h-3.5 text-theme-brand/40 shrink-0 mt-1" />
          <p className="text-sm text-theme-text-body">{formatBold(trimmed.substring(2))}</p>
        </div>
      );
    }

    // Numbered lists
    if (/^\d+\./.test(trimmed)) {
      return (
        <div key={i} className="flex gap-3 ml-1 py-2">
          <span className="text-xs font-bold font-mono text-theme-brand opacity-50">{trimmed.split('.')[0]}.</span>
          <p className="text-sm font-semibold text-theme-text-heading">{formatBold(trimmed.split('.').slice(1).join('.'))}</p>
        </div>
      );
    }

    return <p key={i} className="text-sm text-theme-text-body py-0.5">{formatBold(trimmed)}</p>;
  });
}

/**
 * Minimal bold text formatter (**text**)
 */
function formatBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-theme-text-heading">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
