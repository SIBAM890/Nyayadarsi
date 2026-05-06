import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, BarChart3, Fingerprint, Activity, Layers, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { BidderComparisonTable } from '@/components/evaluation/BidderComparisonTable';
import { VerdictRow } from '@/components/evaluation/VerdictRow';
import { YellowItem } from '@/components/evaluation/YellowItem';
import { CollusionPanel } from '@/components/evaluation/CollusionPanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useEvaluation, useCollusionScan } from '@/hooks/useEvaluation';
import { TENDER_ID } from '@/constants';
import type { BidderEvaluation } from '@/types/evaluation';

const DEMO_OFFICER_ID = 'OFF_DEMO_001';

export default function EvaluationDashboard() {
  const { evalData, yellowQueue, loading } = useEvaluation(TENDER_ID);
  const { collusionData, scanning, scan } = useCollusionScan();
  const [selectedBidder, setSelectedBidder] = useState<BidderEvaluation | null>(null);
  const [showCollusion, setShowCollusion] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');

  // Auto-select first bidder on load
  useEffect(() => {
    if (evalData?.bidders && evalData.bidders.length > 0 && !selectedBidder) {
      setSelectedBidder(evalData.bidders[0]);
    }
  }, [evalData, selectedBidder]);

  const handleCollusionScan = useCallback(async () => {
    const bids = evalData?.bidders?.map((b) => ({
      bidder: b.company_name,
      amount: b.bid_amount || 0,
    })) || [];
    await scan(bids, TENDER_ID);
    setShowCollusion(true);
  }, [evalData, scan]);

  if (loading) {
    return (
      <Layout title="Evaluation Officer — Mission Control">
        <LoadingSpinner message="Establishing secure connection to evaluation matrix..." />
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Evaluation Dashboard — Nyayadarsi</title>
      </Head>

      {/* We bypass the default padding of Layout by rendering inside a raw div if needed, 
          but Layout already wraps main in <div className="p-8">. 
          To do edge-to-edge we need negative margins or rewrite Layout. 
          Assuming standard Layout padding, we'll make our own full-height container inside it. */}
      <Layout title="Evaluation Officer — Review Bids">
        {/* Negative margin to break out of layout padding and fill screen */}
        <div className="flex h-screen overflow-hidden">

          {/* LEFT SIDEBAR (280px fixed) */}
          <div className="w-[320px] flex-shrink-0 border-r border-theme-border bg-theme-bg-footer flex flex-col z-10">
            {/* Tender Info */}
            <div className="p-5 border-b border-theme-border bg-theme-bg-card/50">
              <span className="text-[10px] font-mono text-theme-text-muted uppercase tracking-widest">{evalData?.tender_id}</span>
              <h3 className="text-sm font-semibold text-theme-text-heading mt-1 leading-snug">{evalData?.tender_title}</h3>
              <p className="text-xs text-theme-text-muted mt-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-theme-status-green-text" /> Live Evaluation
              </p>
            </div>

            {/* Bidder List */}
            <div className="flex-1 relative max-h-[500px] overflow-hidden flex flex-col">
              <div className="px-5 pt-4 pb-2 bg-theme-bg-footer z-10 shrink-0">
                <h4 className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-0.5">Submitted Bids</h4>
                <p className="text-[10px] text-theme-text-muted mb-3">Showing {evalData?.bidders?.length || 0} bids</p>
                
                {/* Color Legend */}
                <div className="flex items-center gap-3 text-[9px] font-semibold tracking-wider uppercase text-theme-text-muted border-t border-theme-border pt-2.5 pb-1">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-theme-status-green-text"></div> Compliant</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-theme-status-yellow-text"></div> Review</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-theme-status-red-text"></div> Flagged</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 relative pb-8">
                {evalData?.bidders?.map((bidder) => {
                  const isSelected = selectedBidder?.bidder_id === bidder.bidder_id;
                  const redCount = bidder.verdicts?.filter(v => v.verdict === 'RED').length || 0;
                  const yellowCount = bidder.verdicts?.filter(v => v.verdict === 'YELLOW').length || 0;
                  let riskLine = 'All criteria met';
                  if (redCount > 0) riskLine = `${redCount} criteria failed`;
                  else if (yellowCount > 0) riskLine = `${yellowCount} flags require review`;

                  return (
                    <motion.button
                      key={bidder.bidder_id}
                      onClick={() => { setViewMode('list'); setSelectedBidder(bidder); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${isSelected
                          ? 'bg-theme-bg-active border-l-[3px] border-theme-brand shadow-sm'
                          : 'bg-theme-bg-card border-l-[3px] border-transparent hover:bg-theme-bg-active border border-theme-border'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${bidder.overall_verdict === 'GREEN' ? 'bg-theme-status-green-bg text-theme-status-green-text' :
                            bidder.overall_verdict === 'RED' ? 'bg-theme-status-red-bg text-theme-status-red-text' :
                              'bg-theme-status-yellow-bg text-theme-status-yellow-text'
                          }`}>
                          {bidder.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-theme-text-heading whitespace-normal leading-tight mb-0.5">{bidder.company_name}</p>
                          <p className="text-[10px] text-theme-text-muted font-mono mt-0.5">₹{(bidder.bid_amount! / 100000).toFixed(1)}L</p>
                          <p className="text-[10px] text-theme-text-muted mt-1.5 font-medium">{riskLine}</p>
                        </div>
                        <VerdictBadge verdict={bidder.overall_verdict} />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-theme-bg-footer to-transparent pointer-events-none" />
            </div>

            {/* Collusion Trigger */}
            <div className="p-4 border-t border-theme-border bg-theme-bg-footer/80 backdrop-blur-md z-20">
              <button
                onClick={handleCollusionScan}
                disabled={scanning}
                className={`w-full py-3 px-4 rounded-lg flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  scanning 
                    ? 'bg-theme-bg-active text-theme-text-muted' 
                    : 'bg-theme-brand hover:bg-theme-brand-hover text-white'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <Layers className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                  {scanning ? 'Running Scan...' : 'Run Collusion Scan'}
                </div>
                <span className="text-[9px] text-white/80 font-medium">Last run: Never</span>
              </button>

              {collusionData && !scanning && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-theme-status-red-text bg-theme-status-red-bg py-1.5 rounded border border-theme-status-red-text/30">
                  <ShieldAlert className="w-3.5 h-3.5" /> {collusionData.total_triggered} Anomalies Found
                </div>
              )}
            </div>
          </div>

          {/* MAIN PANEL */}
          <div className="flex-1 bg-theme-bg-primary overflow-y-auto relative z-0">
            <div className="max-w-5xl mx-auto p-8">

              {/* Header Actions */}
              <div className="flex justify-start mb-6">
                <div className="bg-theme-bg-footer p-1 rounded-lg border border-theme-border flex gap-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-theme-bg-card text-theme-text-heading shadow-sm border border-theme-border' : 'text-theme-text-muted hover:text-theme-text-heading border border-transparent'}`}
                  >
                    Individual Evaluation
                  </button>
                  <button
                    onClick={() => setViewMode('compare')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'compare' ? 'bg-theme-bg-card text-theme-text-heading shadow-sm border border-theme-border' : 'text-theme-text-muted hover:text-theme-text-heading border border-transparent'}`}
                  >
                    Comparative Matrix
                  </button>
                </div>
              </div>

              {viewMode === 'compare' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-xl font-display font-light mb-6 text-nyaya-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-nyaya-500" /> Cross-Bidder Analysis
                  </h2>
                  <BidderComparisonTable bidders={evalData?.bidders || []} />
                </motion.div>
              ) : (
                <>
                  {!selectedBidder ? (
                    <div className="h-96 flex flex-col items-center justify-center text-nyaya-500 border border-dashed border-[#E8E8E8] rounded-2xl">
                      <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">Select a bidder from the terminal on the left to begin forensic review.</p>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedBidder.bidder_id}>
                      {/* Bidder Header */}
                      <div className="flex items-start justify-between mb-8 pb-6 border-b border-theme-border">
                        <div>
                          <h2 className="text-3xl font-display font-semibold text-theme-text-heading mb-2">{selectedBidder.company_name}</h2>
                          <div className="flex items-center gap-4 text-sm font-mono text-theme-text-muted">
                            <span className="bg-theme-bg-footer px-2 py-1 rounded border border-theme-border">ID: {selectedBidder.bidder_id}</span>
                            <span className="bg-theme-bg-footer px-2 py-1 rounded border border-theme-border">Bid: ₹{(selectedBidder.bid_amount! / 100000).toFixed(1)} Lakhs</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-theme-text-muted mb-2">Final AI Verdict</p>
                          <VerdictBadge verdict={selectedBidder.overall_verdict} />
                        </div>
                      </div>

                      {/* Criterion Table */}
                      <h3 className="text-sm font-bold uppercase tracking-widest text-nyaya-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Criteria Extraction Matrix
                      </h3>
                      <div className="space-y-3 mb-12">
                        {selectedBidder.verdicts?.map((v, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={v.criterion_id || i}
                          >
                            <VerdictRow verdict={v} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Yellow Queue */}
              {yellowQueue?.items?.length && yellowQueue.items.length > 0 && viewMode === 'list' && selectedBidder && (() => {
                const bidderItems = yellowQueue.items.filter(item => item.bidder_id === selectedBidder.bidder_id);
                if (bidderItems.length === 0) return null;
                return (
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
                    <div className="flex items-center gap-3 mb-6 bg-theme-alert-banner-bg border border-theme-alert-banner-border px-4 py-3 rounded-lg text-theme-brand">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold tracking-wide uppercase text-theme-brand">Manual Review Required</h4>
                        <p className="text-xs opacity-80 mt-0.5 text-theme-brand">{bidderItems.length} items flagged for human authorization for this bidder.</p>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      <AnimatePresence>
                        {bidderItems.map((item) => (
                          <motion.div
                            key={`${item.bidder_id}-${item.criterion_id}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -100 }}
                            layout
                          >
                            <YellowItem item={item} officerId={DEMO_OFFICER_ID} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                );
              })()}

            </div>
          </div>

          {/* COLLUSION PANEL (Slide-in) */}
          <AnimatePresence>
            {showCollusion && collusionData && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[450px] flex-shrink-0 border-l border-[#E8E8E8] bg-surface-1 shadow-2xl z-20 flex flex-col relative"
              >
                <div className="absolute top-4 right-4 z-50">
                  <button onClick={() => setShowCollusion(false)} className="p-1.5 bg-surface-2 hover:bg-surface-3 rounded-md text-nyaya-400 hover:text-nyaya-100 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                {/* Re-using the exact CollusionPanel component but wrapping its contents */}
                <div className="flex-1 overflow-y-auto">
                  <CollusionPanel data={collusionData} onClose={() => setShowCollusion(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </Layout>
    </>
  );
}
