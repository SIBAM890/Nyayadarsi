/**
 * Builder data hooks — milestones and payments.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getMilestones, triggerPayment } from '@/services/builderService';
import type { MilestoneData, Milestone } from '@/types/builder';

interface UseMilestonesReturn {
  milestoneData: MilestoneData | null;
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  completedCount: number;
  totalPayment: number;
  releasedPayment: number;
  overallProgress: number;
  handleTriggerPayment: (milestoneId: string, officerId: string) => Promise<string | null>;
}

export function useMilestones(contractId: string): UseMilestonesReturn {
  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      setLoading(true);
      const { data, error: err } = await getMilestones(contractId);
      if (!mountedRef.current) return;
      if (err) setError(err);
      if (data) setMilestoneData(data);
      setLoading(false);
    }

    load();
    return () => { mountedRef.current = false; };
  }, [contractId]);

  const milestones = milestoneData?.milestones ?? [];

  const completedCount = useMemo(
    () => milestones.filter((m) => m.status === 'completed').length,
    [milestones]
  );

  const totalPayment = useMemo(
    () => milestones.reduce((sum, m) => sum + (m.payment_amount || 0), 0),
    [milestones]
  );

  const releasedPayment = useMemo(
    () =>
      milestones
        .filter((m) => m.payment_status === 'released')
        .reduce((sum, m) => sum + (m.payment_amount || 0), 0),
    [milestones]
  );

  const overallProgress = useMemo(
    () =>
      milestones.length > 0
        ? Math.round(milestones.reduce((sum, m) => sum + m.current_percent, 0) / milestones.length)
        : 0,
    [milestones]
  );

  const handleTriggerPayment = useCallback(
    async (milestoneId: string, officerId: string): Promise<string | null> => {
      const { data, error: err } = await triggerPayment({
        milestone_id: milestoneId,
        officer_id: officerId,
        confirmation_note: 'Milestone verified and confirmed for payment release.',
      });
      if (err) return null;
      if (data) return `Payment scheduled. Auto-release: ${data.release_at}`;
      return null;
    },
    []
  );

  return {
    milestoneData,
    milestones,
    loading,
    error,
    completedCount,
    totalPayment,
    releasedPayment,
    overallProgress,
    handleTriggerPayment,
  };
}
