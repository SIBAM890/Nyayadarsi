/**
 * Builder Dashboard — GPS uploads, milestones, payments.
 */
import { useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { MilestoneCard } from '@/components/builder/MilestoneCard';
import { GPSUploadSection } from '@/components/builder/GPSUploadSection';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMilestones } from '@/hooks/useBuilder';
import { CONTRACT_ID } from '@/constants';

const DEMO_OFFICER_ID = 'OFF_DEMO_001';

export default function BuilderDashboard() {
  const {
    milestoneData,
    milestones,
    loading,
    completedCount,
    totalPayment,
    releasedPayment,
    overallProgress,
    handleTriggerPayment,
  } = useMilestones(CONTRACT_ID);

  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);

  const onTriggerPayment = useCallback(
    async (milestoneId: string) => {
      const msg = await handleTriggerPayment(milestoneId, DEMO_OFFICER_ID);
      if (msg) setPaymentMsg(msg);
    },
    [handleTriggerPayment]
  );

  if (loading) {
    return (
      <Layout title="Builder — Progress Monitoring">
        <LoadingSpinner message="Loading builder data..." />
      </Layout>
    );
  }

  return (
    <>
      <Head><title>Builder Dashboard — Nyayadarsi</title></Head>
      <Layout title="Builder — Progress Monitoring">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Overall Progress" value={`${overallProgress}%`} icon="📊" />
            <StatCard label="Milestones" value={`${completedCount}/${milestones.length}`} icon="🎯" />
            <StatCard label="Released" value={`₹${(releasedPayment / 100000).toFixed(1)}L`} icon="💰" />
            <StatCard label="Total Value" value={`₹${(totalPayment / 100000).toFixed(1)}L`} icon="💎" />
          </div>

          {paymentMsg && (
            <div className="px-5 py-3 rounded-xl bg-verdict-green/10 border border-verdict-green/20 text-sm text-verdict-green animate-slide-up">
              {paymentMsg}
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <GPSUploadSection />
              <div className="glass-card p-5 mt-4">
                <h4 className="text-sm font-bold text-white mb-3">Contract Details</h4>
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
            <div className="col-span-7 space-y-4">
              <h4 className="section-title text-base">Milestone Tracker</h4>
              {milestones.map((ms) => (
                <MilestoneCard key={ms.id} milestone={ms} onTriggerPayment={onTriggerPayment} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
