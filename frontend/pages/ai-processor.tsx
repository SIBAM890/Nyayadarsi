import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { uploadAndProcess } from '@/services/uploadService';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIProcessorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: apiError } = await uploadAndProcess(file);

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setResult(data.processed_text);
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Processor — Nyayadarsi</title>
      </Head>
      <Layout title="AI Document Processor">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <section className="glass-card p-8 border-nyaya-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Cpu className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Intelligence Extraction Layer</h2>
            <p className="text-sm text-nyaya-400 max-w-2xl">
              Upload any procurement document (PDF or TXT) to have the Nyayadarsi AI engine analyze, 
              summarize, and extract key insights. Powered by Gemini 2.5 Flash and DeepSeek.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
            {/* Left: Upload Zone */}
            <div className="space-y-4">
              <div 
                className={`glass-card p-6 border-dashed border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                  file ? 'border-nyaya-400/40 bg-nyaya-400/[0.03]' : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  file ? 'bg-nyaya-400/20 text-nyaya-400' : 'bg-white/5 text-white/40'
                }`}>
                  {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-white/90">
                    {file ? file.name : 'Choose a document'}
                  </div>
                  <div className="text-[10px] text-nyaya-500 mt-1 uppercase tracking-wider">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF OR TXT (MAX 10MB)'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-3 rounded-lg font-display font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${
                  !file || loading
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-nyaya-600 text-white hover:bg-nyaya-500 shadow-lg shadow-nyaya-600/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Run AI Analysis
                  </>
                )}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-verdict-red/10 border border-verdict-red/20 rounded-lg flex gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-verdict-red shrink-0 mt-0.5" />
                    <p className="text-[11px] text-verdict-red leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Output Zone */}
            <div className="glass-card min-h-[400px] flex flex-col relative overflow-hidden border-white/[0.06]">
              {/* Terminal Header */}
              <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-verdict-red/40" />
                  <div className="w-2 h-2 rounded-full bg-verdict-yellow/40" />
                  <div className="w-2 h-2 rounded-full bg-verdict-green/40" />
                </div>
                <div className="mx-auto font-mono text-[9px] text-nyaya-500 tracking-widest uppercase">
                  AI Output Terminal
                </div>
              </div>

              <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed relative">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-nyaya-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] tracking-widest uppercase animate-pulse">Scanning Document Patterns</span>
                  </div>
                ) : result ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/90 whitespace-pre-wrap"
                  >
                    {result}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
                    <FileText className="w-12 h-12 stroke-[1]" />
                    <span className="text-[11px] tracking-widest uppercase">System Idle — Awaiting Input</span>
                  </div>
                )}
              </div>

              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-10"
                style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-nyaya-500 tracking-widest uppercase">Primary Engine</span>
              <span className="text-sm text-white font-medium">Gemini 2.5 Flash</span>
            </div>
            <div className="flex flex-col gap-1 text-center md:text-left">
              <span className="text-[10px] font-mono text-nyaya-500 tracking-widest uppercase">Fallback System</span>
              <span className="text-sm text-white font-medium">DeepSeek via OpenRouter</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] font-mono text-nyaya-500 tracking-widest uppercase">Audit Status</span>
              <span className="text-sm text-verdict-green font-medium flex items-center justify-end gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-verdict-green" />
                VERIFIED HASH
              </span>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
