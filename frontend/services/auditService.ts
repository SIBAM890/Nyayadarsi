/**
 * Audit API service — trail, upload evidence with AI analysis, and export.
 * Now supports AI evidence upload and analysis.
 */
import { apiFetch, apiUpload } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { AuditTrailResponse } from '@/types/audit';

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
 * Get all audit entries for a specific entity.
 */
export async function getAuditTrail(
  entityId: string
): Promise<ApiResponse<AuditTrailResponse>> {
  return apiFetch<AuditTrailResponse>(`/api/v1/audit/${entityId}/trail`);
}

/**
 * Get the full global system audit trail.
 */
export async function getAllAuditEntries(): Promise<ApiResponse<AuditTrailResponse>> {
  return apiFetch<AuditTrailResponse>('/api/v1/audit/all');
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

  return apiUpload<EvidenceUploadResponse>('/api/v1/audit/upload', formData);
}

/**
 * System health check.
 */
export async function healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
  return apiFetch<{ status: string; version: string }>('/api/health');
}
