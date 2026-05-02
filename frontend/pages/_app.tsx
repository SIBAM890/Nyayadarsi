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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Nyayadarsi — AI that sees justice | न्यायदर्शी</title>
        <meta
          name="description"
          content="AI-Powered Procurement Justice Platform for Indian Government Procurement. Real-time tender evaluation, fraud detection, and accountability."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖️</text></svg>"
        />
      </Head>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <Component {...pageProps} />
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
