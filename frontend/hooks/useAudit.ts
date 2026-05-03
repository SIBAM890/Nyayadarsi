import { useState, useCallback, useEffect } from 'react';
import { getAuditTrail, getAllAuditEntries } from '@/services/auditService';
import type { AuditTrailResponse } from '@/types/audit';

export function useAudit(entityId?: string) {
  const [data, setData] = useState<AuditTrailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiErr } = await (entityId 
        ? getAuditTrail(entityId)
        : getAllAuditEntries());
      if (apiErr) {
        setError(apiErr);
      } else {
        setData(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit records');
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return { data, loading, error, refresh: fetchAudit };
}
