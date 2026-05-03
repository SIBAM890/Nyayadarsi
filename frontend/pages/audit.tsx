import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAudit } from '@/hooks/useAudit';
import { uploadEvidence } from '@/services/auditService';
import { Upload, CheckCircle2, AlertCircle, Loader2, Shield, Hash, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditDashboard() {
  const { data, loading, error, refresh } = useAudit();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) { setUploadError('Select a file first.'); return; }
    setUploading(true); setUploadError(null); setResult(null);
    try {
      const { data: d, error: apiErr } = await uploadEvidence(file);
      if (apiErr) setUploadError(apiErr);
      else if (d) { setResult(d); refresh(); }
    } catch (err: any) {
      setUploadError('Network error.');
    } finally { setUploading(false); }
  };

  return (
    <>
      <Head><title>Audit Logs — Nyayadarsi</title></Head>
      <Layout title="System Audit Logs">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Upload Evidence */}
          <section className="glass-card p-6 border-nyaya-600/20">
            <h3 className="text-lg text-nyaya-200/80 flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4"/>Upload Evidence for AI Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
              <div className="space-y-4">
                <div className={`glass-card p-5 border-dashed border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${file?'border-nyaya-400/40 bg-nyaya-400/[0.03]':'border-white/10 hover:border-white/20'}`}
                  onClick={()=>document.getElementById('evidence-upload')?.click()}>
                  <input type="file" id="evidence-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt"/>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${file?'bg-nyaya-400/20 text-nyaya-400':'bg-white/5 text-white/40'}`}>
                    {file?<CheckCircle2 className="w-5 h-5"/>:<Upload className="w-5 h-5"/>}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white/90">{file?file.name:'Choose a document'}</div>
                    <div className="text-[10px] text-nyaya-500 mt-1 uppercase tracking-wider">{file?`${(file.size/1024).toFixed(1)} KB`:'PDF OR TXT'}</div>
                  </div>
                </div>
                <button onClick={handleUpload} disabled={!file||uploading}
                  className={`w-full py-3 rounded-lg font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${!file||uploading?'bg-white/5 text-white/20 cursor-not-allowed':'bg-nyaya-600 text-white hover:bg-nyaya-500 shadow-lg shadow-nyaya-600/20'}`}>
                  {uploading?(<><Loader2 className="w-4 h-4 animate-spin"/>Processing...</>):(<><Cpu className="w-4 h-4"/>Run AI Analysis</>)}
                </button>
                <AnimatePresence>
                  {uploadError&&(<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="p-3 bg-verdict-red/10 border border-verdict-red/20 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-verdict-red shrink-0"/><p className="text-[11px] text-verdict-red">{uploadError}</p>
                  </motion.div>)}
                </AnimatePresence>
              </div>

              {/* Analysis Output */}
              <div className="glass-card min-h-[280px] flex flex-col relative overflow-hidden border-white/[0.06]">
                <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                  <div className="mx-auto font-mono text-[9px] text-nyaya-500 tracking-widest uppercase">AI Evidence Analysis</div>
                </div>
                <div className="flex-1 p-5 font-mono text-[13px] leading-relaxed relative">
                  {uploading?(<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-nyaya-500">
                    <Loader2 className="w-8 h-8 animate-spin"/><span className="text-[10px] tracking-widest uppercase animate-pulse">Analyzing Evidence...</span>
                  </div>):result?(<motion.div initial={{opacity:0}} animate={{opacity:1}}>
                    <div className="mb-3 flex items-center gap-2 text-verdict-green text-[11px]">
                      <Hash className="w-3 h-3"/>SHA-256 Verified: {result.doc_hash.slice(0,24)}...
                    </div>
                    <div className="text-white/90 whitespace-pre-wrap">{result.analysis}</div>
                    <div className="mt-3 text-[10px] text-nyaya-500">Model: {result.model_used} | Audit ID: {result.audit.audit_id}</div>
                  </motion.div>):(<div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
                    <Shield className="w-10 h-10"/><span className="text-[11px] tracking-widest uppercase">Awaiting Evidence Upload</span>
                  </div>)}
                </div>
              </div>
            </div>
          </section>

          {/* Audit Trail */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg text-nyaya-200/80">Cryptographic Audit Trail</h3>
              <p className="text-xs text-nyaya-400/50 mt-1">Immutable, SHA-256 hashed ledger.</p>
            </div>
            <button onClick={refresh} className="btn-secondary text-sm" disabled={loading}>{loading?'Refreshing...':'Refresh Logs'}</button>
          </div>

          {loading?(<LoadingSpinner message="Fetching cryptographic records..."/>):error?(
            <div className="glass-card p-12 text-center border-verdict-red/20 bg-verdict-red/[0.03]"><p className="text-verdict-red">{error}</p></div>
          ):(<AuditTimeline data={data}/>)}

        </div>
      </Layout>
    </>
  );
}
