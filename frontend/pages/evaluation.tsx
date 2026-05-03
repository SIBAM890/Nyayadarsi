import { useState, useCallback } from 'react';
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
        <div className="flex h-[calc(100vh-8.5rem)] -m-8 border-t border-white/[0.06] overflow-hidden">
          
          {/* LEFT SIDEBAR (280px fixed) */}
          <div className="w-[320px] flex-shrink-0 border-r border-white/[0.06] bg-surface-1 flex flex-col z-10">
            {/* Tender Info */}
            <div className="p-5 border-b border-white/[0.06] bg-surface-0/50">
              <span className="text-[10px] font-mono text-nyaya-500 uppercase tracking-widest">{evalData?.tender_id}</span>
              <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{evalData?.tender_title}</h3>
              <p className="text-xs text-nyaya-400 mt-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-verdict-green" /> Live Evaluation
              </p>
            </div>

            {/* Bidder List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <h4 className="text-[10px] font-bold text-nyaya-500 uppercase tracking-widest px-2 mb-3 mt-2">Submitted Bids ({evalData?.bidders?.length || 0})</h4>
              
              {evalData?.bidders?.map((bidder) => {
                const isSelected = selectedBidder?.bidder_id === bidder.bidder_id;
                return (
                  <motion.button
                    key={bidder.bidder_id}
                    onClick={() => { setViewMode('list'); setSelectedBidder(bidder); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-nyaya-600/10 border-nyaya-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-surface-0 border-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        bidder.overall_verdict === 'GREEN' ? 'bg-verdict-green/20 text-verdict-green' :
                        bidder.overall_verdict === 'RED' ? 'bg-verdict-red/20 text-verdict-red' :
                        'bg-verdict-yellow/20 text-verdict-yellow'
                      }`}>
                        {bidder.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{bidder.company_name}</p>
                        <p className="text-[10px] text-nyaya-400 font-mono mt-0.5">₹{(bidder.bid_amount! / 100000).toFixed(1)}L</p>
                      </div>
                      <VerdictBadge verdict={bidder.overall_verdict} />
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Collusion Trigger */}
            <div className="p-4 border-t border-white/[0.06] bg-surface-1/80 backdrop-blur-md">
              <button 
                onClick={handleCollusionScan} 
                disabled={scanning}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  scanning ? 'bg-surface-3 text-nyaya-400' : 'bg-accent-600/20 text-accent-500 border border-accent-500/30 hover:bg-accent-500 hover:text-white shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                }`}
              >
                <Layers className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Running Forensic Scan...' : 'Run Collusion Scan'}
              </button>
              
              {collusionData && !scanning && (
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-verdict-red bg-verdict-red/10 py-1.5 rounded border border-verdict-red/20">
                  <ShieldAlert className="w-3 h-3" /> {collusionData.total_triggered} Flags Detected
                </div>
              )}
            </div>
          </div>

          {/* MAIN PANEL */}
          <div className="flex-1 bg-surface-0 overflow-y-auto relative z-0">
            <div className="max-w-5xl mx-auto p-8">
              
              {/* Header Actions */}
              <div className="flex justify-end mb-6">
                <div className="bg-surface-1 p-1 rounded-lg border border-white/[0.06] flex gap-1">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-surface-3 text-white shadow' : 'text-nyaya-400 hover:text-white'}`}
                  >
                    Individual Evaluation
                  </button>
                  <button 
                    onClick={() => setViewMode('compare')} 
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'compare' ? 'bg-surface-3 text-white shadow' : 'text-nyaya-400 hover:text-white'}`}
                  >
                    Comparative Matrix
                  </button>
                </div>
              </div>

              {viewMode === 'compare' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-xl font-display font-light mb-6 text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-nyaya-500" /> Cross-Bidder Analysis
                  </h2>
                  <BidderComparisonTable bidders={evalData?.bidders || []} />
                </motion.div>
              ) : (
                <>
                  {!selectedBidder ? (
                    <div className="h-96 flex flex-col items-center justify-center text-nyaya-500 border border-dashed border-white/[0.1] rounded-2xl">
                      <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">Select a bidder from the terminal on the left to begin forensic review.</p>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedBidder.bidder_id}>
                      {/* Bidder Header */}
                      <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/[0.06]">
                        <div>
                          <h2 className="text-3xl font-display font-semibold text-white mb-2">{selectedBidder.company_name}</h2>
                          <div className="flex items-center gap-4 text-sm font-mono text-nyaya-400">
                            <span className="bg-surface-2 px-2 py-1 rounded border border-white/[0.04]">ID: {selectedBidder.bidder_id}</span>
                            <span className="bg-surface-2 px-2 py-1 rounded border border-white/[0.04]">Bid: ₹{(selectedBidder.bid_amount! / 100000).toFixed(1)} Lakhs</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-nyaya-500 mb-2">Final AI Verdict</p>
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
              {yellowQueue?.items?.length && yellowQueue.items.length > 0 && viewMode === 'list' && (
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
                  <div className="flex items-center gap-3 mb-6 bg-accent-500/10 border border-accent-500/20 px-4 py-3 rounded-lg text-accent-500">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm font-bold tracking-wide uppercase">Manual Review Required</h4>
                      <p className="text-xs opacity-80 mt-0.5">{yellowQueue.total_yellow} items flagged for human authorization.</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    <AnimatePresence>
                      {yellowQueue.items.map((item) => {
                        // Only show if it belongs to selected bidder, or show all if no bidder selected
                        if (selectedBidder && item.bidder_id !== selectedBidder.bidder_id) return null;
                        
                        return (
                          <motion.div 
                            key={`${item.bidder_id}-${item.criterion_id}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -100 }}
                            layout
                          >
                            <YellowItem item={item} officerId={DEMO_OFFICER_ID} />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.section>
              )}

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
                className="w-[450px] flex-shrink-0 border-l border-white/[0.06] bg-surface-1 shadow-2xl z-20 flex flex-col relative"
              >
                <div className="absolute top-4 right-4 z-50">
                  <button onClick={() => setShowCollusion(false)} className="p-1.5 bg-surface-2 hover:bg-surface-3 rounded-md text-nyaya-400 hover:text-white transition-colors">
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
