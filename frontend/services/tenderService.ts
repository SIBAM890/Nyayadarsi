/**
 * Tender API service — upload, integrity check, status.
 */
import { apiFetch, apiUpload } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  TenderUploadResponse,
  IntegrityAlertResponse,
  TenderStatusResponse,
} from '@/types/tender';

export async function uploadTender(
  file: File
): Promise<ApiResponse<TenderUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<TenderUploadResponse>('/api/tender/upload', formData);
}

export async function checkIntegrity(
  criterionText: string,
  category = 'construction'
): Promise<ApiResponse<IntegrityAlertResponse>> {
  return apiFetch<IntegrityAlertResponse>('/api/tender/integrity-check', {
    method: 'POST',
    body: JSON.stringify({ criterion_text: criterionText, category }),
  });
}

export async function getTenderStatus(
  tenderId: string
): Promise<ApiResponse<TenderStatusResponse>> {
  return apiFetch<TenderStatusResponse>(`/api/tender/${tenderId}/status`);
}
