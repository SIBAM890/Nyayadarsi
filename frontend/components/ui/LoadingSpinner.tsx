/**
 * LoadingSpinner — standardized loading state with optional message.
 */
import React, { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  icon?: string;
}

function LoadingSpinnerInner({ message = 'Loading...', icon }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-nyaya-500/20 flex items-center justify-center animate-pulse">
          {icon ? (
            <span className="text-xl">{icon}</span>
          ) : (
            <svg
              className="w-6 h-6 text-nyaya-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
        </div>
        <p className="text-sm text-nyaya-300/50">{message}</p>
      </div>
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerInner);
