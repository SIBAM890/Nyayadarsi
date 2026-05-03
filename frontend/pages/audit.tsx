import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAudit } from '@/hooks/useAudit';

export default function AuditDashboard() {
  const { data, loading, error, refresh } = useAudit(); // Fetch all audit logs

  return (
    <>
      <Head>
        <title>Audit Logs — Nyayadarsi</title>
      </Head>
      <Layout title="System Audit Logs">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg text-nyaya-200/80">Cryptographic Audit Trail</h3>
              <p className="text-xs text-nyaya-400/50 mt-1">
                Immutable, SHA-256 hashed ledger of system actions and AI extractions.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={refresh} className="btn-secondary text-sm" disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Logs'}
              </button>
              <button 
                className="btn-primary text-sm" 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/audit/export-pdf`, '_blank')}
              >
                Export PDF Report
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching cryptographic records..." />
          ) : error ? (
            <div className="glass-card p-12 text-center border-verdict-red/20 bg-verdict-red/[0.03]">
              <p className="text-verdict-red">{error}</p>
            </div>
          ) : (
            <AuditTimeline data={data} />
          )}
        </div>
      </Layout>
    </>
  );
}
