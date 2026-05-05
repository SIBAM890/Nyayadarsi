import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, UploadCloud, CheckCircle2, AlertTriangle, AlertCircle,
  Clock, Hash, ShieldCheck, FileWarning, Search, Zap, Activity 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useTenderUpload } from '@/hooks/useTender';
import { useAudit } from '@/hooks/useAudit';

export default function GovDashboard() {
  const [time, setTime] = useState<string>('');
  const { upload, result, error, isLoading, reset } = useTenderUpload();
  const { data: auditData } = useAudit();
  
  // Fake progress steps state
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = ['Extract', 'Classify', 'Validate', 'Alert Check'];

  const [overrideModal, setOverrideModal] = useState<{ isOpen: boolean, criterionId: string | null }>({ isOpen: false, criterionId: null });
  const [justification, setJustification] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoading) {
      let currentStep = 0;
      setLoadingStep(0);
      const interval = setInterval(() => {
        currentStep += 1;
        if (currentStep < loadingSteps.length) {
          setLoadingStep(currentStep);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      upload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      upload(e.target.files[0]);
    }
  };

  return (
    <>
      <Head>
        <title>Government Dashboard — Nyayadarsi</title>
      </Head>

      <Layout title="Government Officer — Create Tender">
        {/* Break out of Layout padding for edge-to-edge 3-column grid */}
        <div className="flex h-[calc(100vh-8.5rem)] -m-8 border-t border-white/[0.06] overflow-hidden">

        {/* Inline header with officer info */}
        <div className="absolute top-0 right-0 z-30 flex items-center gap-4 pr-8 pt-3">
          <div className="flex items-center gap-2 text-xs font-mono text-nyaya-300 bg-surface-2 px-3 py-1.5 rounded-md border border-white/[0.04]">
            <Clock className="w-3.5 h-3.5" />
            {time}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-nyaya-600/20 flex items-center justify-center border border-nyaya-500/30">
              <span className="text-xs font-bold text-nyaya-300">GO</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Ananya Sharma</span>
              <span className="text-[10px] text-nyaya-500 uppercase tracking-widest">Procurement Dir</span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* LEFT COLUMN (25%) */}
          <div className="col-span-3 border-r border-white/[0.06] bg-surface-1 flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold tracking-wide uppercase text-nyaya-300">Active Tenders</h3>
              <span className="text-xs bg-nyaya-600/20 text-nyaya-400 px-2 py-0.5 rounded-full">3</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { id: 'CRPF-2025-CONST-001', title: 'Border Outpost Construction', status: 'Evaluating', progress: 65, color: 'text-accent-500' },
                { id: 'CRPF-2025-TECH-042', title: 'Surveillance Drone Procurement', status: 'Published', progress: 30, color: 'text-nyaya-500' },
                { id: 'CRPF-2026-MED-009', title: 'Field Hospital Equipment', status: 'Drafting', progress: 10, color: 'text-nyaya-400' },
              ].map(tender => (
                <div key={tender.id} className="glass-card-hover p-4 cursor-pointer relative overflow-hidden group">
                  {tender.status === 'Evaluating' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-mono text-nyaya-500">{tender.id}</p>
                      <p className="text-sm font-medium mt-0.5 group-hover:text-nyaya-300 transition-colors">{tender.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className={`font-semibold ${tender.color}`}>{tender.status}</span>
                    <span className="text-nyaya-400">{tender.progress}%</span>
                  </div>
                  <div className="w-full bg-white/[0.04] h-1 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${tender.color.replace('text', 'bg')}`} style={{ width: `${tender.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/[0.06]">
              <button onClick={reset} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <Plus className="w-4 h-4" />
                New Tender
              </button>
            </div>
          </div>

          {/* CENTER COLUMN (50%) */}
          <div className="col-span-6 border-r border-white/[0.06] bg-surface-0 overflow-y-auto relative h-[calc(100vh-3.5rem)]">
            <div className="p-8">
              
              {!isLoading && !result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-center">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-display font-light mb-2">Tender Intake</h2>
                    <p className="text-sm text-nyaya-400">Upload tender document for automated Gemini extraction.</p>
                  </div>

                  <div 
                    onDragOver={e => e.preventDefault()} 
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-white/[0.1] hover:border-nyaya-500/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-surface-1/30 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full bg-nyaya-600/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-nyaya-600/20 transition-all">
                      <UploadCloud className="w-8 h-8 text-nyaya-400 group-hover:text-nyaya-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Upload Tender PDF</h3>
                    <p className="text-sm text-nyaya-500 mb-6">Drag and drop or click to browse</p>
                    <label className="btn-secondary cursor-pointer">
                      Browse Files
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                    </label>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px bg-white/[0.06] flex-1" />
                    <span className="text-xs text-nyaya-500 uppercase tracking-widest font-semibold">OR</span>
                    <div className="h-px bg-white/[0.06] flex-1" />
                  </div>

                  <div className="mt-8 bg-surface-1/50 border border-white/[0.06] rounded-xl p-6">
                    <h4 className="text-sm font-medium mb-4 text-nyaya-300">Manual Criteria Entry</h4>
                    <div className="flex gap-3">
                      <input type="text" placeholder="e.g., Minimum turnover of ₹50 Lakhs..." className="input-field flex-1" />
                      <select className="input-field w-32 appearance-none">
                        <option>Financial</option>
                        <option>Technical</option>
                        <option>Compliance</option>
                      </select>
                      <button className="btn-secondary">Add</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 relative mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-nyaya-600/20 border-t-nyaya-500 animate-spin" />
                    <Zap className="w-8 h-8 text-nyaya-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-display font-light mb-2">Gemini AI reading tender...</h3>
                  
                  {/* Live active step status */}
                  <p className="text-sm text-nyaya-400 mb-8 animate-pulse">
                    ⚡ {loadingSteps[loadingStep] ?? 'Processing'} — Analyzing tender with AI...
                  </p>
                  
                  <div className="w-64 space-y-4">
                    {loadingSteps.map((step, index) => {
                      const isActive = index === loadingStep;
                      const isComplete = index < loadingStep;
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isComplete ? 'bg-verdict-green/20 text-verdict-green' : isActive ? 'bg-nyaya-600/20 text-nyaya-400 animate-pulse' : 'bg-surface-3 text-nyaya-600'}`}>
                            {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </div>
                          <span className={`text-sm ${isComplete ? 'text-nyaya-300' : isActive ? 'text-white font-medium' : 'text-nyaya-600'}`}>{step}</span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-light mb-2">Extraction Results</h2>
                      <div className="flex items-center gap-3">
                        <span className="badge-green">{result.total_criteria} CRITERIA EXTRACTED</span>
                        <span className="text-[10px] font-mono text-nyaya-500 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {result.doc_hash.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Confidence Warning Banner */}
                  {result.extraction_warning && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-amber-300">AI Extraction Notice</p>
                          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {result.extraction_warning.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400/80 leading-relaxed">
                          {result.extraction_warning.message}
                        </p>
                        <p className="text-xs text-nyaya-500 mt-2 italic">
                          The model returned low-confidence output, so we safely fallback to an empty criteria set.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {result.criteria?.map((c, i) => (
                      <div key={c.criterion_id || i} className="glass-card relative overflow-hidden group border-white/[0.04]">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.category === 'financial' ? 'bg-nyaya-500' : c.category === 'technical' ? 'bg-accent-500' : 'bg-verdict-green'}`} />
                        
                        {c.integrity_alert && (
                          <div className="bg-verdict-red/10 border-b border-verdict-red/20 px-5 py-2 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-verdict-red" />
                            <span className="text-xs font-semibold text-verdict-red uppercase tracking-wide">Integrity Alert Detected</span>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase tracking-widest font-bold ${c.is_mandatory ? 'text-accent-500' : 'text-nyaya-400'}`}>
                                {c.is_mandatory ? 'MANDATORY' : 'DISCRETIONARY'}
                              </span>
                              <span className="text-nyaya-600 text-xs">•</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-nyaya-400">{c.category}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-surface-1 px-2 py-1 rounded text-[10px] font-mono text-nyaya-400">
                              <ShieldCheck className="w-3 h-3 text-verdict-green" />
                              {((c.confidence ?? 0) * 100).toFixed(0)}% Conf
                            </div>
                          </div>
                          <p className="text-sm text-white leading-relaxed mb-3">{c.description}</p>
                          {c.threshold_value && (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-nyaya-600/10 border border-nyaya-600/20 rounded-md text-xs font-medium text-nyaya-200">
                              Threshold: <span className="text-white">{c.threshold_value}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (25%) */}
          <div className="col-span-3 bg-surface-1 h-[calc(100vh-3.5rem)] flex flex-col">
            
            {/* Alerts Panel */}
            <div className="flex-1 overflow-y-auto border-b border-white/[0.06]">
              <div className="p-5 border-b border-white/[0.06] bg-verdict-red/[0.02]">
                <div className="flex items-center gap-2 text-verdict-red">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-display font-semibold tracking-wide uppercase">Integrity Alerts</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {result?.alerts && result.alerts.length > 0 ? (
                  result.alerts.map((alert, i) => (
                    <div key={i} className="bg-surface-0 border border-verdict-red/20 rounded-lg overflow-hidden">
                      <div className="bg-verdict-red/10 px-3 py-2 border-b border-verdict-red/10">
                        <span className="text-xs font-semibold text-verdict-red">{(alert.alert_type ?? 'ALERT').replace(/_/g, ' ')}</span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-nyaya-300 leading-relaxed mb-2">{alert.reason}</p>
                        <p className="text-[10px] text-nyaya-500 mb-4 bg-surface-1 p-2 rounded">Est. qualifying vendors: 2</p>
                        <div className="flex gap-2">
                          <button className="flex-1 btn-ghost text-xs py-1.5 border border-white/[0.06]">Revise</button>
                          <button onClick={() => setOverrideModal({ isOpen: true, criterionId: alert.criterion_id })} className="flex-1 bg-verdict-red/20 hover:bg-verdict-red/30 text-verdict-red text-xs py-1.5 rounded-md transition-colors font-medium">Override</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-nyaya-500">
                    <ShieldCheck className="w-8 h-8 mb-2 opacity-50 text-verdict-green" />
                    <p className="text-xs">No active alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log Widget */}
            <div className="h-64 flex flex-col bg-surface-0">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-nyaya-400 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Live Audit Log
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {auditData?.trail?.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="w-px h-full bg-white/[0.06] mt-2 relative">
                      <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-nyaya-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-nyaya-500 mb-0.5">
                        {mounted ? new Date(entry.timestamp + 'Z').toLocaleTimeString() : '--:--'}
                      </p>
                      <p className="text-xs text-nyaya-200">{entry.action.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] font-mono text-nyaya-500 mt-1 flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" /> {entry.sha256_output.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                )) || <p className="text-xs text-nyaya-500 text-center mt-4">Loading audit stream...</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
      </Layout>

      {/* Override Modal */}
      <AnimatePresence>
        {overrideModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverrideModal({ isOpen: false, criterionId: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface-1 border border-white/[0.1] shadow-2xl shadow-black/50 rounded-xl w-[500px] overflow-hidden">
              <div className="bg-verdict-red/10 border-b border-verdict-red/20 px-6 py-4 flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-verdict-red" />
                <h3 className="text-base font-semibold text-white">Override Integrity Alert</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-nyaya-300 mb-4 leading-relaxed">
                  You are about to override an AI-flagged integrity alert. This action requires mandatory cryptographic justification and will be permanently logged in the SHA-256 audit trail.
                </p>
                <textarea 
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Enter detailed justification (minimum 50 characters)..."
                  className="w-full h-32 bg-surface-0 border border-white/[0.1] rounded-lg p-3 text-sm text-white placeholder:text-nyaya-500 focus:outline-none focus:border-verdict-red/50 transition-colors mb-2 resize-none"
                />
                <div className="flex justify-between items-center mb-6 text-xs">
                  <span className={`${justification.length < 50 ? 'text-verdict-red' : 'text-verdict-green'}`}>{justification.length} / 50 min chars</span>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setOverrideModal({ isOpen: false, criterionId: null })} className="btn-ghost">Cancel</button>
                  <button 
                    disabled={justification.length < 50} 
                    onClick={() => setOverrideModal({ isOpen: false, criterionId: null })}
                    className="btn-primary bg-verdict-red hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    Override & Cryptographically Sign
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
