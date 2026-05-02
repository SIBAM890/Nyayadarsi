/**
 * ErrorMessage — standardized inline error display.
 */
import React, { memo } from 'react';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessageInner({ message }: ErrorMessageProps) {
  return (
    <div className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-slide-up">
      {message}
    </div>
  );
}

export const ErrorMessage = memo(ErrorMessageInner);
