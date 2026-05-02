/**
 * Evaluation API service — results, yellow queue, officer decisions.
 */
import { apiFetch } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  EvaluationData,
  YellowQueueResponse,
  OfficerDecisionPayload,
  OfficerDecisionResponse,
} from '@/types/evaluation';

export async function getEvaluationResults(
  tenderId: string
): Promise<ApiResponse<EvaluationData>> {
  return apiFetch<EvaluationData>(`/api/evaluation/${tenderId}/results`);
}

export async function getYellowQueue(
  tenderId: string
): Promise<ApiResponse<YellowQueueResponse>> {
  return apiFetch<YellowQueueResponse>(`/api/evaluation/${tenderId}/yellow-queue`);
}

export async function postOfficerDecision(
  payload: OfficerDecisionPayload
): Promise<ApiResponse<OfficerDecisionResponse>> {
  return apiFetch<OfficerDecisionResponse>('/api/evaluation/officer-decision', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
