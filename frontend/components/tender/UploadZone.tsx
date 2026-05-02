/**
 * UploadZone — drag-and-drop PDF upload area with processing state.
 */
import React, { useState, useCallback, memo } from 'react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

function UploadZoneInner({ onUpload, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && file.name.endsWith('.pdf')) onUpload(file);
    },
    [onUpload]
  );

  const handleClick = useCallback(() => {
    if (isLoading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) onUpload(target.files[0]);
    };
    input.click();
  }, [isLoading, onUpload]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`relative glass-card p-10 text-center transition-all duration-300 cursor-pointer group ${
        dragActive ? 'border-nyaya-400/50 bg-nyaya-500/10' : 'hover:border-nyaya-500/30'
      } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload tender PDF"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-nyaya-500/20 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-nyaya-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-nyaya-300/70">Processing with Gemini AI...</p>
          <p className="text-xs text-nyaya-400/40">Extracting eligibility criteria from tender document</p>
          <div className="w-48 mx-auto h-1 bg-nyaya-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nyaya-500 to-saffron-500 rounded-full animate-shimmer"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-nyaya-600/20 flex items-center justify-center group-hover:bg-nyaya-500/20 transition-colors">
            <span className="text-3xl">📄</span>
          </div>
          <div>
            <p className="text-sm font-medium text-nyaya-200/80">
              Drop tender PDF here or click to upload
            </p>
            <p className="text-xs text-nyaya-400/40 mt-1">
              Gemini AI will extract all eligibility criteria automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const UploadZone = memo(UploadZoneInner);
