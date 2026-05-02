/**
 * LoadingSpinner — standardized loading state with optional message.
 */
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

function LoadingSpinnerInner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-lg bg-surface-3 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-nyaya-400 animate-spin" />
        </div>
        <p className="text-sm text-nyaya-400">{message}</p>
      </div>
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerInner);
