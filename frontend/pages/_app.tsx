/**
 * _app.tsx — Next.js application root.
 * Wraps all pages with global providers and error boundary.
 */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '@/store/AuthContext';
import { NotificationProvider, useNotification } from '@/store/NotificationContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toast } from '@/components/ui/Toast';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';

function ToastContainer() {
  const { notifications, dismiss } = useNotification();
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}

import { useAuth } from '@/hooks/useAuth';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Nyayadarsi — AI-Powered Procurement Accountability</title>
        <meta
          name="description"
          content="AI-Powered Procurement Accountability Platform for Indian Government. Real-time tender evaluation, collusion detection, and audit trail."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect rx='20' width='100' height='100' fill='%233d4a85'/><text y='.88em' x='50' text-anchor='middle' font-size='60' fill='white'>N</text></svg>"
        />
      </Head>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AuthWrapper>
              <Component {...pageProps} />
            </AuthWrapper>
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
