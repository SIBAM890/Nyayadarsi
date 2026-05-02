/**
 * Tender data hooks — upload management and integrity checks.
 */
import { useState, useCallback } from 'react';
import { uploadTender, checkIntegrity } from '@/services/tenderService';
import type { TenderUploadResponse, IntegrityAlertResponse } from '@/types/tender';

interface UseTenderUploadReturn {
  upload: (file: File) => Promise<void>;
  result: TenderUploadResponse | null;
  error: string | null;
  isLoading: boolean;
  reset: () => void;
}

export function useTenderUpload(): UseTenderUploadReturn {
  const [result, setResult] = useState<TenderUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const upload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const { data, error: err } = await uploadTender(file);
    setIsLoading(false);

    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { upload, result, error, isLoading, reset };
}

interface UseIntegrityCheckReturn {
  check: (criterionText: string, category?: string) => Promise<void>;
  alert: IntegrityAlertResponse | null;
  isChecking: boolean;
}

export function useIntegrityCheck(): UseIntegrityCheckReturn {
  const [alert, setAlert] = useState<IntegrityAlertResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (criterionText: string, category = 'construction') => {
    setIsChecking(true);
    setAlert(null);
    const { data } = await checkIntegrity(criterionText, category);
    setIsChecking(false);
    if (data) setAlert(data);
  }, []);

  return { check, alert, isChecking };
}
