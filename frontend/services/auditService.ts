/**
 * Audit API service — trail and export.
 */
import { apiFetch } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { AuditTrailResponse } from '@/types/audit';

export async function getAuditTrail(
  entityId: string
): Promise<ApiResponse<AuditTrailResponse>> {
  return apiFetch<AuditTrailResponse>(`/api/audit/${entityId}/trail`);
}

export async function getAllAuditEntries(): Promise<ApiResponse<AuditTrailResponse>> {
  return apiFetch<AuditTrailResponse>('/api/audit/all');
}

export async function healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
  return apiFetch<{ status: string; version: string }>('/api/health');
}
