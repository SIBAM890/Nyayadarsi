/**
 * Notification context — provides toast-style notifications across the app.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type?: NotificationType) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const notifySuccess = useCallback(
    (message: string) => notify(message, 'success'),
    [notify]
  );

  const notifyError = useCallback(
    (message: string) => notify(message, 'error'),
    [notify]
  );

  return (
    <NotificationContext.Provider value={{ notifications, notify, notifySuccess, notifyError, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return ctx;
}
