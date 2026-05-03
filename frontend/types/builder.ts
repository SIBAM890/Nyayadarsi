/**
 * Builder types — mirrors backend/schemas/builder.py
 */
import type { LocationVerification, LocationVerificationPayload } from '@/types/location';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';
export type PaymentStatus = 'released' | 'locked';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  current_percent: number;
  target_percent: number;
  payment_amount: number;
  payment_status: PaymentStatus;
  ai_verified: boolean;
  officer_confirmed: boolean;
}

export interface MilestoneData {
  contract_id: string;
  contractor: string;
  total_value: number;
  milestones: Milestone[];
}

export interface GPSUploadPayload {
  contract_id: string;
  latitude: number;
  longitude: number;
  photos?: File[];
}

export interface BuilderUploadResponse {
  accepted: boolean;
  distance_meters: number;
  photo_count: number;
  timestamp: string;
  audit_hash: string;
  message: string;
  flagged: boolean;
  reverse_geocoded_address: string | null;
}

export interface PaymentTriggerPayload {
  milestone_id: string;
  officer_id: string;
  confirmation_note?: string;
}

export interface PaymentResponse {
  payment_status: string;
  milestone_id: string;
  release_at: string;
  auto_release_hours: number;
  audit_hash: string;
  message: string;
}

// Re-export location types for convenience
export type { LocationVerification, LocationVerificationPayload };
