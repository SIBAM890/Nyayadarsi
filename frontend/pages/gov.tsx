/**
 * Government Dashboard — tender upload, criteria extraction, integrity checks.
 * Thin orchestrator: all logic in hooks, all UI in components.
 */
import Head from 'next/head';
import { BarChart3, Lock, Paperclip, AlertTriangle, FileText, Hash } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { UploadZone } from '@/components/tender/UploadZone';
import { CriterionCard } from '@/components/tender/CriterionCard';
import { IntegrityAlert } from '@/components/tender/IntegrityAlert';
import { ManualCheckForm } from '@/components/tender/ManualCheckForm';
import { StatCard } from '@/components/ui/StatCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useTenderUpload, useIntegrityCheck } from '@/hooks/useTender';
import { useCallback } from 'react';

export default function GovDashboard() {
  const { upload, result, error, isLoading } = useTenderUpload();
  const { check, alert: manualAlert, isChecking } = useIntegrityCheck();

  const handleUpload = useCallback((file: File) => { upload(file); }, [upload]);
  const handleManualCheck = useCallback(async (text: string) => { await check(text); }, [check]);

  return (
    <>
      <Head>
        <title>Government Dashboard — Nyayadarsi</title>
      </Head>
      <Layout title="Government Officer — Create Tender">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Upload Section */}
          <section>
            <div className="mb-4">
              <h3 className="section-title">Upload Tender Document</h3>
              <p className="section-subtitle">Upload an existing tender PDF — Gemini AI extracts all eligibility criteria</p>
            </div>
            <UploadZone onUpload={handleUpload} isLoading={isLoading} />
          </section>

          {error && <ErrorMessage message={error} />}

          {result && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Total Criteria" value={result.total_criteria} icon={<BarChart3 className="w-4 h-4" />} />
                <StatCard label="Mandatory" value={result.mandatory_count} icon={<Lock className="w-4 h-4" />} />
                <StatCard label="Discretionary" value={result.discretionary_count} icon={<Paperclip className="w-4 h-4" />} />
                <StatCard label="Alerts" value={result.alerts?.length || 0} icon={<AlertTriangle className="w-4 h-4" />} />
                <StatCard label="Pages" value={result.pdf_info?.pages || 0} icon={<FileText className="w-4 h-4" />} />
              </div>

              {/* Doc Hash */}
              <div className="glass-card px-4 py-3 flex items-center gap-3">
                <Hash className="w-4 h-4 text-nyaya-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-nyaya-500 font-medium">Document SHA-256</p>
                  <p className="text-xs font-mono text-nyaya-300 break-all">{result.doc_hash}</p>
                </div>
              </div>

              {/* Integrity Alerts */}
              {result.alerts?.length > 0 && (
                <section>
                  <h3 className="section-title mb-3">Integrity Alerts ({result.alerts.length})</h3>
                  <div className="space-y-3">
                    {result.alerts.map((a, i) => (
                      <IntegrityAlert
                        key={a.criterion_id || i}
                        alert={a}
                        onRevise={() => {}}
                        onOverride={(justification) => console.log('Override:', justification)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Extracted Criteria */}
              <section>
                <h3 className="section-title mb-3">Extracted Criteria ({result.criteria?.length})</h3>
                <div className="grid gap-3">
                  {result.criteria?.map((c, i) => (
                    <CriterionCard key={c.criterion_id || i} criterion={c} index={i} />
                  ))}
                </div>
              </section>
            </div>
          )}

          <ManualCheckForm onCheck={handleManualCheck} alert={manualAlert} isChecking={isChecking} />
        </div>
      </Layout>
    </>
  );
}
