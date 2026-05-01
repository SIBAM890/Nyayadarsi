import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { getEvaluationResults, getYellowQueue, postOfficerDecision, runCollusionScan } from '../lib/api';
import { TENDER_ID, VERDICT_COLORS } from '../lib/constants';

// ── Verdict Badge ──
function VerdictBadge({ verdict }) {
  const cls = verdict === 'GREEN' ? 'badge-green' : verdict === 'YELLOW' ? 'badge-yellow' : 'badge-red';
  return <span className={cls}>{verdict}</span>;
}

// ── Confidence Bar ──
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? 'bg-verdict-green' : pct >= 60 ? 'bg-verdict-yellow' : 'bg-verdict-red';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-nyaya-400/60 font-mono w-10 text-right">{pct}%</span>
    </div>
  );
}

// ── Verdict Row ──
function VerdictRow({ v }) {
  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <VerdictBadge verdict={v.verdict} />
            <span className="text-xs font-mono text-nyaya-400/40">{v.criterion_id}</span>
            {v.mandatory && <span className="badge-red text-[10px]">MANDATORY</span>}
          </div>
          <p className="text-sm text-nyaya-100/80">{v.criterion}</p>
        </div>
      </div>
      {v.confidence != null && <ConfidenceBar value={v.confidence} />}
      {v.citation && (
        <div className="px-3 py-2 rounded-lg bg-nyaya-800/30 border border-white/5 text-xs text-nyaya-300/60 leading-relaxed">
          📎 {v.citation}
        </div>
      )}
      {v.ambiguity && (
        <div className="px-3 py-2 rounded-lg bg-verdict-yellow/10 border border-verdict-yellow/20 text-xs text-verdict-yellow/80 leading-relaxed">
          ⚠️ {v.ambiguity}
        </div>
      )}
    </div>
  );
}

// ── Yellow Item ──
function YellowItem({ item, onDecision }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decided, setDecided] = useState(false);

  const handleDecision = async (decision) => {
    if (reason.length < 10) return;
    setSubmitting(true);
    const { data, error } = await postOfficerDecision({
      tender_id: TENDER_ID,
      bidder_id: item.bidder_id,
      criterion_id: item.criterion_id,
      decision,
      reason,
      officer_id: 'OFF_DEMO_001',
    });
    setSubmitting(false);
    if (data) {
      setDecided(true);
      if (onDecision) onDecision(data);
    }
  };

  if (decided) {
    return (
      <div className="glass-card p-4 border-verdict-green/20 bg-verdict-green/5 animate-slide-up">
        <div className="flex items-center gap-2 text-verdict-green text-sm">
          ✅ Decision recorded and logged to audit trail
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 border-verdict-yellow/20 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <VerdictBadge verdict="YELLOW" />
            {item.blocker && <span className="badge-red text-[10px]">BLOCKER</span>}
            {item.mandatory && <span className="badge-red text-[10px]">MANDATORY</span>}
          </div>
          <p className="text-sm font-medium text-white">{item.company_name}</p>
          <p className="text-xs text-nyaya-400/50 mt-0.5">{item.criterion_id} — {item.criterion || item.flag_reason}</p>
        </div>
        {item.confidence != null && (
          <div className="text-right">
            <p className="text-xs text-nyaya-400/40">Confidence</p>
            <p className="text-lg font-bold text-verdict-yellow">{Math.round(item.confidence * 100)}%</p>
          </div>
        )}
      </div>

      {item.ambiguity && (
        <div className="px-3 py-2 rounded-lg bg-verdict-yellow/10 border border-verdict-yellow/20 text-xs text-verdict-yellow/80 leading-relaxed">
          {item.ambiguity}
        </div>
      )}

      {item.source_document && (
        <p className="text-xs text-nyaya-400/40">
          📄 {item.source_document}{item.source_page ? `, Page ${item.source_page}` : ''}
        </p>
      )}

      {item.officer_options && (
        <div className="text-xs text-nyaya-400/50 space-y-1">
          <p className="font-medium text-nyaya-300/60">Options:</p>
          {item.officer_options.map((opt, i) => (
            <p key={i} className="ml-3">• {opt}</p>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mandatory: Document your reasoning (min 10 characters)..."
          className="input-field text-xs h-16 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={() => handleDecision('PASS')}
            disabled={reason.length < 10 || submitting}
            className="px-4 py-2 bg-verdict-green/20 hover:bg-verdict-green/30 text-verdict-green rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
          >
            {submitting ? '...' : '✓ PASS'}
          </button>
          <button
            onClick={() => handleDecision('FAIL')}
            disabled={reason.length < 10 || submitting}
            className="px-4 py-2 bg-verdict-red/20 hover:bg-verdict-red/30 text-verdict-red rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
          >
            {submitting ? '...' : '✗ FAIL'}
          </button>
        </div>
        {reason.length > 0 && reason.length < 10 && (
          <p className="text-[10px] text-red-400/60">{10 - reason.length} more characters required</p>
        )}
      </div>
    </div>
  );
}

// ── Collusion Panel ──
function CollusionPanel({ data, onClose }) {
  if (!data) return null;
  const flagNames = { BID_CLUSTERING: 'Bid Clustering', CA_FINGERPRINT: 'CA Fingerprint', SHARED_ADDRESS: 'Shared Address', OWNERSHIP_NETWORK: 'Ownership Network', DOC_QUALITY_ASYMMETRY: 'Doc Quality' };
  const flagIcons = { BID_CLUSTERING: '📊', CA_FINGERPRINT: '🔍', SHARED_ADDRESS: '📍', OWNERSHIP_NETWORK: '🕸️', DOC_QUALITY_ASYMMETRY: '📄' };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[500px] bg-nyaya-950 border-l border-white/10 overflow-y-auto p-6 animate-slide-right">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold">🛡️ Collusion Risk Analysis</h3>
          <button onClick={onClose} className="btn-ghost text-xs">✕ Close</button>
        </div>

        <div className="text-sm text-nyaya-300/60 mb-4">
          {data.total_triggered} of {data.flags?.length || 0} flags triggered
        </div>

        <div className="space-y-4">
          {data.flags?.map((flag) => (
            <div key={flag.flag} className={`glass-card p-4 ${flag.triggered ? 'border-verdict-red/30 bg-verdict-red/5' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{flagIcons[flag.flag] || '🔍'}</span>
                  <span className="text-sm font-medium">{flagNames[flag.flag] || flag.flag}</span>
                </div>
                {flag.triggered ? (
                  <span className="badge-red">TRIGGERED</span>
                ) : (
                  <span className="badge-green">CLEAR</span>
                )}
              </div>

              {flag.cv_percent != null && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-nyaya-400/50 mb-1">
                    <span>CV: {flag.cv_percent}%</span>
                    <span>Threshold: 5%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${flag.cv_percent < 5 ? 'bg-verdict-red' : 'bg-verdict-green'}`}
                      style={{ width: `${Math.min(100, (flag.cv_percent / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {flag.similarity_score != null && (
                <p className="text-xs text-nyaya-300/60">Similarity: <span className="font-bold text-verdict-red">{Math.round(flag.similarity_score * 100)}%</span></p>
              )}

              {flag.evidence?.interpretation && (
                <p className="text-xs text-nyaya-400/50 mt-2 leading-relaxed">{flag.evidence.interpretation}</p>
              )}

              {flag.evidence?.matching_features?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {flag.evidence.matching_features.map((f, i) => (
                    <p key={i} className="text-xs text-nyaya-400/40 ml-3">• {f}</p>
                  ))}
                </div>
              )}

              {flag.reason && <p className="text-xs text-nyaya-400/40 mt-2 italic">{flag.reason}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function EvaluationDashboard() {
  const [evalData, setEvalData] = useState(null);
  const [yellowQueue, setYellowQueue] = useState(null);
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [collusionData, setCollusionData] = useState(null);
  const [showCollusion, setShowCollusion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanningCollusion, setScanningCollusion] = useState(false);

  useEffect(() => {
    async function load() {
      const [evalRes, yellowRes] = await Promise.all([
        getEvaluationResults(TENDER_ID),
        getYellowQueue(TENDER_ID),
      ]);
      if (evalRes.data) setEvalData(evalRes.data);
      if (yellowRes.data) setYellowQueue(yellowRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCollusionScan = async () => {
    setScanningCollusion(true);
    const bids = evalData?.bidders?.map(b => ({ bidder: b.company_name, amount: b.bid_amount || 0 })) || [];
    const { data } = await runCollusionScan({ tender_id: TENDER_ID, bids });
    setScanningCollusion(false);
    if (data) {
      setCollusionData(data);
      setShowCollusion(true);
    }
  };

  if (loading) {
    return (
      <Layout title="Evaluation Officer — Review Bids">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-nyaya-500/20 flex items-center justify-center animate-pulse">🛡️</div>
            <p className="text-sm text-nyaya-300/50">Loading evaluation data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head><title>Evaluation Dashboard — Nyayadarsi</title></Head>
      <Layout title="Evaluation Officer — Review Bids">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-nyaya-400/50 font-mono">{evalData?.tender_id}</p>
              <h3 className="text-lg text-nyaya-200/80">{evalData?.tender_title}</h3>
            </div>
            <button
              onClick={handleCollusionScan}
              disabled={scanningCollusion}
              className="btn-saffron text-sm"
            >
              {scanningCollusion ? 'Scanning...' : '🛡️ Collusion Risk Scan'}
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Bidder List — Left Panel */}
            <div className="col-span-4 space-y-3">
              <h4 className="section-title text-base">Bidders ({evalData?.bidders?.length || 0})</h4>
              {evalData?.bidders?.map((bidder) => (
                <button
                  key={bidder.bidder_id}
                  onClick={() => setSelectedBidder(bidder)}
                  className={`w-full text-left glass-card-hover p-4 ${
                    selectedBidder?.bidder_id === bidder.bidder_id ? 'border-nyaya-500/40 bg-nyaya-600/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{bidder.company_name}</span>
                    <VerdictBadge verdict={bidder.overall_verdict} />
                  </div>
                  <p className="text-xs text-nyaya-400/40">{bidder.bidder_id} • {bidder.verdicts?.length || 0} criteria</p>
                  {bidder.bid_amount && (
                    <p className="text-xs text-nyaya-300/50 mt-1">₹{(bidder.bid_amount / 100000).toFixed(1)}L</p>
                  )}
                </button>
              ))}
            </div>

            {/* Verdict Panel — Right Panel */}
            <div className="col-span-8 space-y-4">
              {selectedBidder ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-base">{selectedBidder.company_name}</h4>
                    <VerdictBadge verdict={selectedBidder.overall_verdict} />
                  </div>
                  <div className="space-y-3">
                    {selectedBidder.verdicts?.map((v, i) => (
                      <VerdictRow key={v.criterion_id || i} v={v} />
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

          {/* Yellow Queue */}
          {yellowQueue?.items?.length > 0 && (
            <section className="mt-10">
              <h4 className="section-title mb-1">⚠️ Yellow Queue — Pending Officer Decisions</h4>
              <p className="section-subtitle mb-4">
                {yellowQueue.total_yellow} items requiring human review. Mandatory blockers shown first.
              </p>
              <div className="grid gap-4 max-w-3xl">
                {yellowQueue.items.map((item, i) => (
                  <YellowItem key={`${item.bidder_id}-${item.criterion_id}`} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Collusion Slide-in */}
        {showCollusion && (
          <CollusionPanel data={collusionData} onClose={() => setShowCollusion(false)} />
        )}
      </Layout>
    </>
  );
}
