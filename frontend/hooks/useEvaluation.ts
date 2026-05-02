/**
 * Evaluation data hooks — fetches eval results and yellow queue.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getEvaluationResults, getYellowQueue } from '@/services/evaluationService';
import { runCollusionScan } from '@/services/collusionService';
import type { EvaluationData, YellowQueueResponse } from '@/types/evaluation';
import type { CollusionReportResponse, BidItem } from '@/types/collusion';

interface UseEvaluationReturn {
  evalData: EvaluationData | null;
  yellowQueue: YellowQueueResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvaluation(tenderId: string): UseEvaluationReturn {
  const [evalData, setEvalData] = useState<EvaluationData | null>(null);
  const [yellowQueue, setYellowQueue] = useState<YellowQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [evalRes, yellowRes] = await Promise.all([
      getEvaluationResults(tenderId),
      getYellowQueue(tenderId),
    ]);

    if (!mountedRef.current) return;

    if (evalRes.error) setError(evalRes.error);
    if (evalRes.data) setEvalData(evalRes.data);
    if (yellowRes.data) setYellowQueue(yellowRes.data);
    setLoading(false);
  }, [tenderId]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { evalData, yellowQueue, loading, error, refetch: fetch };
}

interface UseCollusionScanReturn {
  collusionData: CollusionReportResponse | null;
  scanning: boolean;
  scan: (bids: BidItem[], tenderId: string) => Promise<void>;
}

export function useCollusionScan(): UseCollusionScanReturn {
  const [collusionData, setCollusionData] = useState<CollusionReportResponse | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async (bids: BidItem[], tenderId: string) => {
    setScanning(true);
    const { data } = await runCollusionScan({ tender_id: tenderId, bids });
    setScanning(false);
    if (data) setCollusionData(data);
  }, []);

  return { collusionData, scanning, scan };
}
