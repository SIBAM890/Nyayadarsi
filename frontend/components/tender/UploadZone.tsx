/**
 * UploadZone — drag-and-drop PDF upload area with processing state.
 * Theme: Civic Light — Baby red + off-white + black text.
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
      className={`relative bg-white border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group ${
        dragActive
          ? 'border-[#D94040] bg-[#F5E6E6]/30 shadow-[0_0_0_4px_rgba(217,64,64,0.08)]'
          : 'border-[#D0D0D0] hover:border-[#D94040]/50 hover:shadow-[0_16px_48px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)]'
      } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload tender PDF"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#F5E6E6] flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#D94040] animate-spin" />
          </div>
          <p
            className="text-sm font-semibold text-[#1A1A1A]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Processing with Gemini AI...
          </p>
          <p className="text-xs text-[#9A9A9A]">
            Extracting eligibility criteria from tender document
          </p>
          <div className="w-48 mx-auto h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D94040] rounded-full animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#FAF9F6] border border-[#E8E8E8] flex items-center justify-center group-hover:bg-[#F5E6E6] group-hover:border-[#D94040]/20 transition-all duration-300">
            <Upload className="w-6 h-6 text-[#D94040]" />
          </div>
          <div>
            <p
              className="text-base font-semibold text-[#1A1A1A]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Drop tender PDF here or click to upload
            </p>
            <p className="text-xs text-[#9A9A9A] mt-1.5">
              Gemini AI will extract all eligibility criteria automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const UploadZone = memo(UploadZoneInner);
