/**
 * Evaluation Dashboard — bidder review, yellow queue, collusion analysis.
 */
import { useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { BidderList } from '@/components/evaluation/BidderList';
import { VerdictRow } from '@/components/evaluation/VerdictRow';
import { YellowItem } from '@/components/evaluation/YellowItem';
import { CollusionPanel } from '@/components/evaluation/CollusionPanel';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
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

  const handleCollusionScan = useCallback(async () => {
    const bids = evalData?.bidders?.map((b) => ({
      bidder: b.company_name,
      amount: b.bid_amount || 0,
    })) || [];
    await scan(bids, TENDER_ID);
    setShowCollusion(true);
  }, [evalData, scan]);

  const handleSelectBidder = useCallback((bidder: BidderEvaluation) => {
    setSelectedBidder(bidder);
  }, []);

  if (loading) {
    return (
      <Layout title="Evaluation Officer — Review Bids">
        <LoadingSpinner message="Loading evaluation data..." />
      </Layout>
    );
  }

  return (
    <>
      <Head><title>Evaluation Dashboard — Nyayadarsi</title></Head>
      <Layout title="Evaluation Officer — Review Bids">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-nyaya-400/50 font-mono">{evalData?.tender_id}</p>
              <h3 className="text-lg text-nyaya-200/80">{evalData?.tender_title}</h3>
            </div>
            <button onClick={handleCollusionScan} disabled={scanning} className="btn-saffron text-sm">
              {scanning ? 'Scanning...' : 'Collusion Risk Scan'}
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <BidderList
                bidders={evalData?.bidders || []}
                selectedBidderId={selectedBidder?.bidder_id || null}
                onSelect={handleSelectBidder}
              />
            </div>
            <div className="col-span-8 space-y-4">
              {selectedBidder ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-base">{selectedBidder.company_name}</h4>
                    <VerdictBadge verdict={selectedBidder.overall_verdict} />
                  </div>
                  <div className="space-y-3">
                    {selectedBidder.verdicts?.map((v, i) => (
                      <VerdictRow key={v.criterion_id || i} verdict={v} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 text-center">
                  <p className="text-nyaya-400/40">← Select a bidder to view evaluation details</p>
                </div>
              )}
            </div>
          </div>

          {yellowQueue?.items?.length && yellowQueue.items.length > 0 && (
            <section className="mt-10">
              <h4 className="section-title mb-1">Yellow Queue — Pending Officer Decisions</h4>
              <p className="section-subtitle mb-4">
                {yellowQueue.total_yellow} items requiring human review. Mandatory blockers shown first.
              </p>
              <div className="grid gap-4 max-w-3xl">
                {yellowQueue.items.map((item) => (
                  <YellowItem
                    key={`${item.bidder_id}-${item.criterion_id}`}
                    item={item}
                    officerId={DEMO_OFFICER_ID}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {showCollusion && collusionData && (
          <CollusionPanel data={collusionData} onClose={() => setShowCollusion(false)} />
        )}
      </Layout>
    </>
  );
}
