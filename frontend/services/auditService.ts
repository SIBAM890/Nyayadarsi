/**
 * Audit API service — trail, upload evidence with AI analysis, and export.
 */
import { apiFetch, apiUpload } from './apiClient';
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

export interface EvidenceUploadResponse {
  success: boolean;
  entity_id: string;
  filename: string;
  doc_hash: string;
  analysis: string;
  model_used: string;
  audit: {
    audit_id: number;
    input_hash: string;
    output_hash: string;
    timestamp: string;
  };
}

/**
 * Upload a document to the audit system for AI analysis.
 * The AI analyzes the evidence and stores it in the immutable audit trail.
 */
export async function uploadEvidence(
  file: File
): Promise<ApiResponse<EvidenceUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiUpload<EvidenceUploadResponse>('/api/audit/upload', formData);
}

export async function healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
  return apiFetch<{ status: string; version: string }>('/api/health');
}
