/**
 * Toast — notification toast component consumed by NotificationContext.
 */
import React, { memo } from 'react';
import type { Notification, NotificationType } from '@/store/NotificationContext';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const STYLE_MAP: Record<NotificationType, string> = {
  success: 'bg-verdict-green/10 border-verdict-green/20 text-verdict-green',
  error: 'bg-red-500/10 border-red-500/20 text-red-300',
  info: 'bg-nyaya-500/10 border-nyaya-500/20 text-nyaya-300',
};

function ToastInner({ notification, onDismiss }: ToastProps) {
  return (
    <div
      className={`px-5 py-3 rounded-xl border text-sm animate-slide-up flex items-center justify-between gap-4 ${STYLE_MAP[notification.type]}`}
    >
      <span>{notification.message}</span>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export const Toast = memo(ToastInner);
