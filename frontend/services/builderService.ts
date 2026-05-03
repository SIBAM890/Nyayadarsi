/**
 * Builder API service — GPS upload, milestones, payment, location verification.
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
import type { LocationVerification, LocationVerificationPayload } from '@/types/location';

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

/**
 * Verify builder location against the registered site.
 * Returns full verification with reverse-geocoded address and flag status.
 */
export async function verifyLocation(
  payload: LocationVerificationPayload
): Promise<ApiResponse<LocationVerification>> {
  return apiFetch<LocationVerification>(
    `/api/builder/verify-location?latitude=${payload.latitude}&longitude=${payload.longitude}`,
    { method: 'POST' },
  );
}
