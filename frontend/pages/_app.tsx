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
  
  if (isLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1e",
        color: "#3b82f6",
        fontFamily: "monospace",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontSize: "12px"
      }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-nyaya-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" />
          </svg>
          न्यायदर्शी — Initializing
        </div>
      </div>
    );
  }
  
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
