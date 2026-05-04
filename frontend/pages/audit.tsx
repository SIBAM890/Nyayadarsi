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
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-white">System Integrity Ledger</h3>
              <p className="text-xs text-nyaya-500 mt-1 uppercase tracking-widest font-mono">
                SHA-256 Immutable Chain • Court Admissible Evidence
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={refresh} className="btn-secondary text-xs px-4" disabled={loading}>
                {loading ? 'Syncing...' : 'Sync Ledger'}
              </button>
              <button 
                className="btn-primary text-xs px-4" 
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
            <div className="glass-card p-6 border-nyaya-600/20 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-nyaya-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">Submit Evidence</span>
              </div>
              
              <div 
                className={`flex-1 min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  file ? 'border-nyaya-400/40 bg-nyaya-400/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                }`}
                onClick={() => document.getElementById('evidence-upload')?.click()}
              >
                <input type="file" id="evidence-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-nyaya-400" />
                    <div className="text-center px-4">
                      <p className="text-xs font-medium text-white truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-nyaya-500 mt-1 uppercase font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-white/20" />
                    <p className="text-[10px] text-nyaya-500 uppercase tracking-widest">Select Evidence PDF/TXT</p>
                  </>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-2.5 rounded-lg bg-nyaya-600 hover:bg-nyaya-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
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
            <div className="glass-card flex flex-col bg-surface-1 border-white/[0.06] overflow-hidden min-h-[300px]">
              <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-verdict-red/40" />
                  <div className="w-2 h-2 rounded-full bg-verdict-yellow/40" />
                  <div className="w-2 h-2 rounded-full bg-verdict-green/40" />
                </div>
                <div className="font-mono text-[9px] text-nyaya-500 tracking-[0.3em] uppercase">Evidence Intelligence</div>
                {docHash && (
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-verdict-green">
                    <Fingerprint className="w-3 h-3" />
                    {docHash.substring(0, 16)}...
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-6 relative">
                <AnimatePresence mode="wait">
                  {uploading ? (
                    <motion.div 
                      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    >
                      <Loader2 className="w-8 h-8 text-nyaya-500 animate-spin" />
                      <p className="text-[10px] text-nyaya-500 tracking-[0.2em] uppercase animate-pulse">Running Forensic AI Analysis</p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div 
                      key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="font-mono text-[13px] leading-relaxed text-white/80 whitespace-pre-wrap"
                    >
                      {analysis}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-white/10 opacity-40">
                      <Shield className="w-12 h-12 stroke-[1]" />
                      <p className="text-[10px] tracking-[0.2em] uppercase">Await Evidence Submission</p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
                  style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
              </div>
            </div>
          </section>

          {/* Audit Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-nyaya-300 uppercase tracking-widest flex items-center gap-2">
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
