import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAudit } from '@/hooks/useAudit';
import { useAuth } from '@/hooks/useAuth';
import { uploadEvidence } from '@/services/auditService';
import { getToken } from '@/services/authService';
import { 
  UploadCloud, Cpu, CheckCircle2, AlertCircle, 
  Loader2, FileText, Fingerprint, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditDashboard() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error, refresh } = useAudit(undefined, isAuthenticated);
  
  // AI Evidence State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docHash, setDocHash] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
      setAnalysis(null);
      setDocHash(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { data: resData, error: apiError } = await uploadEvidence(file);
      if (apiError) {
        setUploadError(apiError);
      } else if (resData) {
        setAnalysis(resData.analysis);
        setDocHash(resData.doc_hash);
        refresh(); // Refresh logs to show new entry
      }
    } catch (err) {
      setUploadError("Network error during evidence upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Audit Trail — Nyayadarsi</title>
      </Head>
      <Layout title="Cryptographic Audit Trail">
        <div className="max-w-5xl mx-auto space-y-8 p-8 min-h-screen">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold text-theme-text-heading">System Integrity Ledger</h2>
              <p className="text-sm text-theme-text-muted mt-1">
                SHA-256 immutable chain • Court admissible evidence
              </p>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={refresh} className="text-xs font-semibold text-theme-brand border border-theme-brand px-4 py-2 rounded bg-transparent hover:bg-theme-bg-active transition-colors" disabled={loading}>
                {loading ? 'Syncing...' : 'Sync ledger'}
              </button>
              <button 
                className="bg-theme-brand hover:bg-theme-brand-hover text-white text-sm px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all" 
                onClick={async () => {
                  try {
                    const API = process.env.NEXT_PUBLIC_API_URL || '';
                    const token = getToken();
                    const response = await fetch(`${API}/api/v1/audit/export-pdf`, {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (!response.ok) throw new Error('Failed to fetch PDF');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nyayadarsi_full_audit_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    alert('Failed to export audit report.');
                  }
                }}
              >
                Export PDF Report
              </button>
            </div>
          </div>

          {/* Integrated AI Evidence Processor */}
          <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            {/* Upload Zone */}
            <div className="glass-card p-6 border-theme-border flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-theme-text-muted" />
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">Submit Evidence</span>
              </div>
              
              <div 
                className={`flex-1 min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  file ? 'border-theme-brand/40 bg-theme-brand/5' : 'border-theme-border hover:border-theme-brand/50 bg-theme-bg-footer'
                }`}
                onClick={() => document.getElementById('evidence-upload')?.click()}
              >
                <input type="file" id="evidence-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-theme-brand" />
                    <div className="text-center px-4">
                      <p className="text-xs font-medium text-theme-text-heading truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-theme-text-muted mt-1 uppercase font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-theme-text-muted" />
                    <p className="text-[10px] text-theme-text-muted uppercase tracking-widest">Select Evidence PDF/TXT</p>
                  </>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                title={!file ? "Upload evidence file to enable analysis" : ""}
                className="w-full py-2.5 rounded-lg bg-theme-brand/5 hover:bg-theme-brand/10 text-theme-brand text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {!file && !uploading && <Shield className="w-3.5 h-3.5 opacity-50" />}
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                {uploading ? 'Analyzing...' : 'Run AI Analysis'}
              </button>

              {uploadError && (
                <div className="p-3 bg-verdict-red/10 border border-verdict-red/20 rounded-lg flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-verdict-red shrink-0" />
                  <p className="text-[10px] text-verdict-red leading-tight">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Analysis Output Terminal */}
            <div className="glass-card flex flex-col bg-theme-bg-card border-theme-border overflow-hidden min-h-[300px]">
              <div className="px-5 py-3 bg-theme-bg-card border-b border-theme-border flex items-center justify-between">
                <div className="text-sm font-semibold text-theme-text-heading">Evidence Intelligence</div>
                {docHash && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-theme-status-green-text">
                    <Fingerprint className="w-3.5 h-3.5" />
                    {docHash.substring(0, 16)}...
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-5 relative overflow-y-auto">
                <AnimatePresence mode="wait">
                  {uploading ? (
                    <motion.div 
                      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-theme-bg-card"
                    >
                      <Loader2 className="w-6 h-6 text-theme-text-muted animate-spin" />
                      <p className="text-xs text-theme-text-muted uppercase tracking-widest animate-pulse">Running analysis...</p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div 
                      key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="font-mono text-xs leading-relaxed text-theme-text-muted whitespace-pre-wrap"
                    >
                      {analysis}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col gap-5 pt-2">
                      <div className="flex items-center gap-3 text-theme-text-muted">
                        <Shield className="w-5 h-5 opacity-60" />
                        <p className="text-sm font-medium">Awaiting evidence submission</p>
                      </div>
                      <div className="space-y-3 opacity-[0.15]">
                        <div className="h-3 bg-theme-border rounded w-3/4"></div>
                        <div className="h-3 bg-theme-border rounded w-full"></div>
                        <div className="h-3 bg-theme-border rounded w-5/6"></div>
                        <div className="h-3 bg-theme-border rounded w-2/3"></div>
                        <div className="h-3 bg-theme-border rounded w-full mt-6"></div>
                        <div className="h-3 bg-theme-border rounded w-4/5"></div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Audit Timeline */}
          <div className="space-y-4 mt-8">
            <h4 className="text-sm font-semibold text-theme-text-muted uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Verified Transaction History
            </h4>
            
            {loading ? (
              <LoadingSpinner message="Decrypting audit chain..." />
            ) : error ? (
              <div className="glass-card p-12 text-center border-verdict-red/20 bg-verdict-red/[0.03]">
                <p className="text-verdict-red text-sm">{error}</p>
              </div>
            ) : (
              <AuditTimeline data={data} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
