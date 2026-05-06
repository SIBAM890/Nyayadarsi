import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, UploadCloud, CheckCircle2, AlertTriangle, AlertCircle,
  Hash, ShieldCheck, FileWarning, Search, Zap, Activity 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useTenderUpload } from '@/hooks/useTender';
import { useAudit } from '@/hooks/useAudit';

export default function GovDashboard() {

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
        <div className="flex h-screen overflow-hidden">



        {/* MAIN LAYOUT */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden bg-theme-bg-primary">
          
          {/* LEFT COLUMN (25%) */}
          <div className="col-span-3 border-r border-theme-border bg-theme-bg-footer flex flex-col h-screen">
            <div className="p-5 border-b border-theme-border flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold tracking-wide uppercase text-theme-text-muted">Active Tenders</h3>
              <span className="text-xs bg-theme-brand/20 text-theme-brand px-2 py-0.5 rounded-full">3</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { id: 'CRPF-2025-CONST-001', title: 'Border Outpost Construction', status: 'Evaluating', progress: 65, colorClass: 'verdict-red' },
                { id: 'CRPF-2025-TECH-042', title: 'Surveillance Drone Procurement', status: 'Published', progress: 30, colorClass: 'nyaya-500' },
                { id: 'CRPF-2026-MED-009', title: 'Field Hospital Equipment', status: 'Drafting', progress: 10, colorClass: 'verdict-green' },
              ].map(tender => {
                const isActive = tender.id === 'CRPF-2025-CONST-001';
                return (
                  <div key={tender.id} className={`p-4 cursor-pointer relative overflow-hidden transition-all hover:shadow-md ${isActive ? 'border-l-[3px] border-l-theme-brand bg-theme-bg-active border-y border-r border-theme-border' : 'border border-theme-border bg-theme-bg-card hover:bg-theme-bg-active'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] font-mono text-theme-text-muted">{tender.id}</p>
                        <p className={`text-sm font-medium mt-0.5 transition-colors ${isActive ? 'text-theme-text-heading' : 'text-theme-text-body group-hover:text-theme-text-heading'}`}>{tender.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${tender.colorClass}/10 text-${tender.colorClass}`}>
                        {tender.status}
                      </span>
                      <span className="text-nyaya-400 font-medium">{tender.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-2 h-1 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full bg-${tender.colorClass}`} style={{ width: `${tender.progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#E8E8E8]">
              <button onClick={reset} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <Plus className="w-4 h-4" />
                New Tender
              </button>
            </div>
          </div>

          {/* CENTER COLUMN (50%) */}
          <div className="col-span-6 border-r border-theme-border bg-theme-bg-primary overflow-y-auto relative h-screen">
            <div className="p-8">
              
              {!isLoading && !result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-center">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-display font-light mb-2 text-theme-text-heading">Tender Intake</h2>
                    <p className="text-sm text-theme-text-muted">Enter criteria for Border Outpost Construction.</p>
                  </div>

                  <div 
                    onDragOver={e => e.preventDefault()} 
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-theme-brand hover:border-theme-brand-hover bg-theme-bg-card rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full bg-theme-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-theme-brand/20 transition-all">
                      <UploadCloud className="w-8 h-8 text-theme-brand group-hover:text-theme-brand-hover" />
                    </div>
                    <h3 className="text-lg font-medium mb-1 text-theme-text-heading">Upload Tender PDF</h3>
                    <p className="text-xs text-theme-text-muted mb-6">LayoutLMv3 extraction preserves table and cell structure.</p>
                    <label className="px-6 py-2.5 bg-theme-brand hover:bg-theme-brand-hover text-white font-medium rounded-lg cursor-pointer transition-colors">
                      Browse Files
                      <input id="tender-file-upload" name="tender-file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                    </label>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-center relative">
                    <div className="h-px bg-theme-border w-full absolute top-1/2 -z-10" />
                    <span className="text-[11px] text-theme-text-muted uppercase tracking-widest font-semibold bg-theme-bg-primary px-4">
                      or enter criteria manually
                    </span>
                  </div>

                  <div className="mt-8 bg-theme-bg-card border border-theme-border shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-theme-bg-footer border-b border-theme-border px-5 py-3">
                      <h4 className="text-sm font-medium text-theme-text-heading">Manual Criteria Entry</h4>
                    </div>
                    <div className="p-5 flex gap-3">
                      <input id="manual-description" name="manual-description" type="text" placeholder="e.g., Minimum turnover of ₹50 Lakhs..." className="input-field flex-1" />
                      <select id="manual-category" name="manual-category" className="input-field w-36 appearance-none bg-surface-0">
                        <option>Financial</option>
                        <option>Technical</option>
                        <option>Compliance</option>
                      </select>
                      <button className="btn-primary px-6">Add</button>
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
                  <h3 className="text-xl font-display font-light mb-2">Nyayadarsi AI reading tender...</h3>
                  
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
                          <span className={`text-sm ${isComplete ? 'text-nyaya-300' : isActive ? 'text-nyaya-100 font-medium' : 'text-nyaya-600'}`}>{step}</span>
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
                      <div key={c.criterion_id || i} className="glass-card relative overflow-hidden group border-[#E8E8E8]">
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
                          <p className="text-sm text-nyaya-100 leading-relaxed mb-3">{c.description}</p>
                          {c.threshold_value && (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-nyaya-600/10 border border-nyaya-600/20 rounded-md text-xs font-medium text-nyaya-200">
                              Threshold: <span className="text-nyaya-100">{c.threshold_value}</span>
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
          <div className="col-span-3 bg-theme-bg-footer h-screen flex flex-col border-l border-theme-border">
            
            {/* Alerts Panel */}
            <div className="flex-1 overflow-y-auto border-b border-theme-border">
              <div className={`p-5 border-b border-theme-border ${(result?.alerts && result.alerts.length > 0) ? 'bg-theme-status-red-bg' : 'bg-theme-bg-card'}`}>
                <div className={`flex items-center gap-2 ${(result?.alerts && result.alerts.length > 0) ? 'text-theme-status-red-text' : 'text-theme-text-muted'}`}>
                  {(result?.alerts && result.alerts.length > 0) ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-verdict-green" />}
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
                          <button className="flex-1 btn-ghost text-xs py-1.5 border border-[#E8E8E8]">Revise</button>
                          <button onClick={() => setOverrideModal({ isOpen: true, criterionId: alert.criterion_id })} className="flex-1 bg-verdict-red/20 hover:bg-verdict-red/30 text-verdict-red text-xs py-1.5 rounded-md transition-colors font-medium">Override</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-nyaya-400">
                    <ShieldCheck className="w-8 h-8 mb-3 opacity-80 text-verdict-green" />
                    <p className="text-xs font-medium text-nyaya-200">No alerts — criteria look broad enough.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tender Health Summary */}
            <div className="flex-1 flex flex-col bg-theme-bg-card border-t border-theme-border">
              <div className="px-5 py-3 border-b border-theme-border flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-theme-text-muted flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Tender Health Summary
                </h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-theme-bg-footer rounded-md p-2 text-center border border-theme-border">
                    <div className="text-lg font-display text-theme-text-heading font-semibold">12</div>
                    <div className="text-[9px] uppercase tracking-wider text-nyaya-500 mt-0.5">Active</div>
                  </div>
                  <div className="bg-verdict-yellow/10 rounded-md p-2 text-center border border-verdict-yellow/20">
                    <div className="text-lg font-display text-verdict-yellow font-semibold">3</div>
                    <div className="text-[9px] uppercase tracking-wider text-verdict-yellow mt-0.5">At-Risk</div>
                  </div>
                  <div className="bg-verdict-green/10 rounded-md p-2 text-center border border-verdict-green/20">
                    <div className="text-lg font-display text-verdict-green font-semibold">68%</div>
                    <div className="text-[9px] uppercase tracking-wider text-verdict-green mt-0.5">Avg progress</div>
                  </div>
                </div>

                {/* Mini Progress Bars */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-medium text-nyaya-200">Border Outpost - Sector 4</p>
                      <span className="text-[10px] font-medium text-nyaya-500">45%</span>
                    </div>
                    <div className="w-full bg-surface-1 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-verdict-green" style={{ width: '45%' }} />
                    </div>
                    <p className="text-[10px] text-verdict-green font-medium">On track</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-medium text-nyaya-200">Field Hospital Wing B</p>
                      <span className="text-[10px] font-medium text-verdict-yellow">60%</span>
                    </div>
                    <div className="w-full bg-surface-1 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-verdict-yellow" style={{ width: '60%' }} />
                    </div>
                    <p className="text-[10px] text-verdict-yellow font-medium">Milestone delay flagged</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-medium text-nyaya-200">HQ Perimeter Wall</p>
                      <span className="text-[10px] font-medium text-verdict-red">85%</span>
                    </div>
                    <div className="w-full bg-surface-1 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-verdict-red" style={{ width: '85%' }} />
                    </div>
                    <p className="text-[10px] text-verdict-red font-medium">GPS verification failed</p>
                  </div>
                </div>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface-1 border border-[#E8E8E8] shadow-2xl shadow-black/50 rounded-xl w-[500px] overflow-hidden">
              <div className="bg-verdict-red/10 border-b border-verdict-red/20 px-6 py-4 flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-verdict-red" />
                <h3 className="text-base font-semibold text-nyaya-100">Override Integrity Alert</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-nyaya-300 mb-4 leading-relaxed">
                  You are about to override an AI-flagged integrity alert. This action requires mandatory cryptographic justification and will be permanently logged in the SHA-256 audit trail.
                </p>
                <textarea 
                  id="override-justification"
                  name="override-justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Enter detailed justification (minimum 50 characters)..."
                  className="w-full h-32 bg-surface-0 border border-[#E8E8E8] rounded-lg p-3 text-sm text-nyaya-100 placeholder:text-nyaya-500 focus:outline-none focus:border-verdict-red/50 transition-colors mb-2 resize-none"
                />
                <div className="flex justify-between items-center mb-6 text-xs">
                  <span className={`${justification.length < 50 ? 'text-verdict-red' : 'text-verdict-green'}`}>{justification.length} / 50 min chars</span>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setOverrideModal({ isOpen: false, criterionId: null })} className="btn-ghost">Cancel</button>
                  <button 
                    disabled={justification.length < 50} 
                    onClick={() => setOverrideModal({ isOpen: false, criterionId: null })}
                    className="btn-primary bg-verdict-red-white"
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
