/**
 * Builder API service — GPS upload, milestones, payment.
 */
import { apiFetch, apiUpload } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  GPSUploadPayload,
  BuilderUploadResponse,
  MilestoneData,
  PaymentTriggerPayload,
  PaymentResponse,
} from '@/types/builder';

export async function uploadBuilderPhoto(
  payload: GPSUploadPayload
): Promise<ApiResponse<BuilderUploadResponse>> {
  const formData = new FormData();
  formData.append('contract_id', payload.contract_id);
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));
  if (payload.photos) {
    payload.photos.forEach((photo) => formData.append('photos', photo));
  }
  return apiUpload<BuilderUploadResponse>('/api/builder/upload', formData);
}

export async function getMilestones(
  contractId: string
): Promise<ApiResponse<MilestoneData>> {
  return apiFetch<MilestoneData>(`/api/builder/${contractId}/milestones`);
}

export async function triggerPayment(
  payload: PaymentTriggerPayload
): Promise<ApiResponse<PaymentResponse>> {
  return apiFetch<PaymentResponse>('/api/payment/trigger', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
