/**
 * UploadZone — drag-and-drop PDF upload area with processing state.
 */
import React, { useState, useCallback, memo } from 'react';
import { Upload, Loader2 } from 'lucide-react';

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
      className={`relative glass-card p-10 text-center transition-all duration-200 cursor-pointer group ${
        dragActive ? 'border-nyaya-500/40 bg-nyaya-600/10' : 'hover:border-white/[0.12]'
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
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-nyaya-600/15 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-nyaya-400 animate-spin" />
          </div>
          <p className="text-sm text-nyaya-300">Processing with Gemini AI...</p>
          <p className="text-xs text-nyaya-500">Extracting eligibility criteria from tender document</p>
          <div className="w-48 mx-auto h-1 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-nyaya-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-surface-3 flex items-center justify-center group-hover:bg-nyaya-600/15 transition-colors">
            <Upload className="w-5 h-5 text-nyaya-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-nyaya-200">
              Drop tender PDF here or click to upload
            </p>
            <p className="text-xs text-nyaya-500 mt-1">
              Gemini AI will extract all eligibility criteria automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const UploadZone = memo(UploadZoneInner);
