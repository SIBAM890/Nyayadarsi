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
  Loader2, FileText, Fingerprint, Shield, Bookmark 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelligenceReport } from '@/components/audit/IntelligenceReport';

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

            {/* Analysis Output Dashboard */}
            <div className="glass-card flex flex-col bg-white border-theme-border overflow-hidden h-[600px] shadow-xl">
              <div className="px-6 py-4 bg-theme-bg-footer/30 border-b border-theme-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-theme-brand/10 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-theme-brand" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-theme-text-heading">Evidence Intelligence Report</div>
                    <div className="text-[10px] text-theme-text-muted uppercase tracking-tighter">Powered by Nyayadarsi AI • GFR 2017 Trained</div>
                  </div>
                </div>
                {docHash && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-theme-status-green-bg border border-theme-status-green-text/20 rounded-full">
                    <Fingerprint className="w-3.5 h-3.5 text-theme-status-green-text" />
                    <span className="font-mono text-[10px] font-semibold text-theme-status-green-text tracking-wider">{docHash.substring(0, 12)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-8 relative overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                <AnimatePresence mode="wait">
                  {uploading ? (
                    <motion.div 
                      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-theme-brand/10 border-t-theme-brand rounded-full animate-spin" />
                        <Cpu className="w-5 h-5 text-theme-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-theme-text-heading uppercase tracking-widest">Scanning Document</p>
                        <p className="text-[10px] text-theme-text-muted mt-1 uppercase tracking-tighter">Extracting GFR Compliance Markers...</p>
                      </div>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div 
                      key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="max-w-3xl mx-auto"
                    >
                      <IntelligenceReport content={analysis} />
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto pt-10">
                      <div className="w-20 h-20 bg-theme-bg-footer rounded-full flex items-center justify-center mb-6">
                        <Shield className="w-10 h-10 text-theme-text-muted/30" />
                      </div>
                      <h4 className="text-base font-semibold text-theme-text-heading mb-2">Awaiting Evidence Submission</h4>
                      <p className="text-xs text-theme-text-muted leading-relaxed mb-8">
                        Upload a procurement document or tender notice to run our GFR 2017 AI Validation protocol.
                      </p>
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
