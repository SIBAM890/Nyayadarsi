import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { getMilestones, uploadBuilderPhoto, triggerPayment } from '../lib/api';
import { CONTRACT_ID } from '../lib/constants';

// ── Milestone Card ──
function MilestoneCard({ milestone, onTriggerPayment }) {
  const statusColors = {
    completed: 'border-verdict-green/30 bg-verdict-green/5',
    in_progress: 'border-verdict-yellow/30 bg-verdict-yellow/5',
    pending: 'border-white/5',
  };
  const statusBadge = {
    completed: 'badge-green',
    in_progress: 'badge-yellow',
    pending: 'px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-nyaya-400/50 border border-white/10',
  };
  const paymentBadge = {
    released: 'badge-green',
    locked: 'px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-nyaya-400/50 border border-white/10',
  };

  return (
    <div className={`glass-card p-5 ${statusColors[milestone.status]} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
          <p className="text-xs text-nyaya-400/50 mt-0.5">{milestone.description}</p>
        </div>
        <span className={statusBadge[milestone.status]}>{milestone.status?.replace('_', ' ').toUpperCase()}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-nyaya-400/50 mb-1">
          <span>Progress</span>
          <span>{milestone.current_percent}% / {milestone.target_percent}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              milestone.current_percent >= milestone.target_percent ? 'bg-verdict-green' :
              milestone.current_percent > 0 ? 'bg-gradient-to-r from-verdict-yellow to-saffron-400' : 'bg-white/10'
            }`}
            style={{ width: `${(milestone.current_percent / milestone.target_percent) * 100}%` }}
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-nyaya-400/40">Payment</p>
          <p className="text-sm font-bold text-white">₹{(milestone.payment_amount / 100000).toFixed(1)}L</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={paymentBadge[milestone.payment_status]}>
            {milestone.payment_status === 'released' ? '💰 RELEASED' : '🔒 LOCKED'}
          </span>
          {milestone.status === 'completed' && milestone.payment_status === 'locked' && (
            <button onClick={() => onTriggerPayment(milestone.id)} className="btn-primary text-xs py-2 px-3">
              Release Payment
            </button>
          )}
        </div>
      </div>

      {/* AI/Officer verification */}
      <div className="flex items-center gap-4 mt-3 text-xs text-nyaya-400/40">
        <span className={milestone.ai_verified ? 'text-verdict-green' : ''}>
          {milestone.ai_verified ? '✅ AI Verified' : '⏳ AI Pending'}
        </span>
        <span className={milestone.officer_confirmed ? 'text-verdict-green' : ''}>
          {milestone.officer_confirmed ? '✅ Officer Confirmed' : '⏳ Officer Pending'}
        </span>
      </div>
    </div>
  );
}

// ── GPS Upload Section ──
function GPSUploadSection() {
  const [lat, setLat] = useState('20.2965');
  const [lon, setLon] = useState('85.8240');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    setUploading(true);
    setResult(null);
    const { data, error } = await uploadBuilderPhoto({
      contract_id: CONTRACT_ID,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    });
    setUploading(false);
    if (error) {
      setResult({ accepted: false, message: typeof error === 'object' ? error.message || JSON.stringify(error) : error });
    } else {
      setResult({ accepted: true, ...data });
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h4 className="section-title text-base">📍 GPS-Verified Upload</h4>
        <p className="section-subtitle">Submit daily progress with location verification</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-nyaya-400/50 block mb-1">Latitude</label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-xs text-nyaya-400/50 block mb-1">Longitude</label>
          <input value={lon} onChange={(e) => setLon(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-nyaya-800/30 text-xs text-nyaya-400/50">
        <p>📌 Registered Site: 20.2961°N, 85.8245°E (CRPF Camp Bhubaneswar)</p>
        <p>📏 Threshold: 100 meters</p>
      </div>

      <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full">
        {uploading ? 'Verifying GPS & Uploading...' : '📤 Submit Progress Upload'}
      </button>

      {result && (
        <div className={`p-4 rounded-xl text-sm animate-slide-up ${
          result.accepted
            ? 'bg-verdict-green/10 border border-verdict-green/20 text-verdict-green'
            : 'bg-verdict-red/10 border border-verdict-red/20 text-verdict-red'
        }`}>
          {result.accepted ? (
            <div>
              <p className="font-bold mb-1">✅ Upload Accepted</p>
              <p className="text-xs opacity-70">Distance: {result.distance_meters}m from site</p>
              {result.audit_hash && (
                <p className="text-xs opacity-50 mt-1 font-mono">Audit: {result.audit_hash?.slice(0, 24)}...</p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-bold mb-1">❌ Upload Rejected</p>
              <p className="text-xs opacity-70">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function BuilderDashboard() {
  const [milestoneData, setMilestoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMsg, setPaymentMsg] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await getMilestones(CONTRACT_ID);
      if (data) setMilestoneData(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleTriggerPayment = async (milestoneId) => {
    const { data, error } = await triggerPayment({
      milestone_id: milestoneId,
      officer_id: 'OFF_DEMO_001',
      confirmation_note: 'Milestone verified and confirmed for payment release.',
    });
    if (data) {
      setPaymentMsg(`✅ Payment scheduled. Auto-release: ${data.release_at}`);
    }
  };

  if (loading) {
    return (
      <Layout title="Builder — Progress Monitoring">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-nyaya-500/20 flex items-center justify-center animate-pulse">🏗️</div>
            <p className="text-sm text-nyaya-300/50">Loading builder data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const milestones = milestoneData?.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalPayment = milestones.reduce((sum, m) => sum + (m.payment_amount || 0), 0);
  const releasedPayment = milestones.filter(m => m.payment_status === 'released').reduce((sum, m) => sum + (m.payment_amount || 0), 0);
  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.current_percent, 0) / milestones.length)
    : 0;

  return (
    <>
      <Head><title>Builder Dashboard — Nyayadarsi</title></Head>
      <Layout title="Builder — Progress Monitoring">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Progress', value: `${overallProgress}%`, icon: '📊' },
              { label: 'Milestones', value: `${completedCount}/${milestones.length}`, icon: '🎯' },
              { label: 'Released', value: `₹${(releasedPayment / 100000).toFixed(1)}L`, icon: '💰' },
              { label: 'Total Value', value: `₹${(totalPayment / 100000).toFixed(1)}L`, icon: '💎' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="stat-value text-2xl">{stat.value}</p>
                <p className="text-xs text-nyaya-400/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {paymentMsg && (
            <div className="px-5 py-3 rounded-xl bg-verdict-green/10 border border-verdict-green/20 text-sm text-verdict-green animate-slide-up">
              {paymentMsg}
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* GPS Upload — Left */}
            <div className="col-span-5">
              <GPSUploadSection />

              {/* Site Info Card */}
              <div className="glass-card p-5 mt-4">
                <h4 className="text-sm font-bold text-white mb-3">🏗️ Contract Details</h4>
                <div className="space-y-2 text-xs text-nyaya-300/60">
                  <div className="flex justify-between">
                    <span className="text-nyaya-400/40">Contract ID</span>
                    <span className="font-mono">{CONTRACT_ID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nyaya-400/40">Contractor</span>
                    <span>{milestoneData?.contractor || 'Acme Infrastructure'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nyaya-400/40">Total Value</span>
                    <span className="font-bold text-white">₹{((milestoneData?.total_value || 0) / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones — Right */}
            <div className="col-span-7 space-y-4">
              <h4 className="section-title text-base">🎯 Milestone Tracker</h4>
              {milestones.map((ms) => (
                <MilestoneCard key={ms.id} milestone={ms} onTriggerPayment={handleTriggerPayment} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
