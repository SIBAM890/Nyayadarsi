/**
 * Collusion API service — scan and report retrieval.
 */
import { apiFetch } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  CollusionRequest,
  CollusionReportResponse,
} from '@/types/collusion';

export async function runCollusionScan(
  payload: CollusionRequest
): Promise<ApiResponse<CollusionReportResponse>> {
  return apiFetch<CollusionReportResponse>('/api/collusion/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCollusionReport(
  tenderId: string
): Promise<ApiResponse<CollusionReportResponse>> {
  return apiFetch<CollusionReportResponse>(`/api/collusion/${tenderId}/report`);
}
