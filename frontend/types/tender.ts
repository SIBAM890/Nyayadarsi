/**
 * Tender types — mirrors backend/schemas/tender.py
 */

export type CriterionType = 'financial' | 'technical' | 'compliance';

export interface TenderCriterion {
  criterion_id: string;
  type: CriterionType;
  description: string;
  threshold: number | null;
  threshold_unit: string | null;
  mandatory: boolean;
  blocker: boolean;
  language_signal: string | null;
  specificity_alert: boolean;
  acceptable_documents: string[];
}

export interface IntegrityAlertResponse {
  alert: boolean;
  reason: string;
  estimated_qualifying_vendors: number;
  criterion_id: string | null;
  checks_triggered: number;
}

export interface PdfInfo {
  pages: number;
  method: string;
  is_scanned: boolean;
  tables_found: number;
}

export interface AuditRecord {
  input_hash: string;
  output_hash: string;
  timestamp: string;
  audit_id: number;
}

export interface TenderUploadResponse {
  tender_id: string;
  doc_hash: string;
  criteria: TenderCriterion[];
  alerts: IntegrityAlertResponse[];
  total_criteria: number;
  mandatory_count: number;
  discretionary_count: number;
  pdf_info: PdfInfo;
  audit: AuditRecord;
}

export interface IntegrityCheckRequest {
  criterion_text: string;
  category: string;
}

export interface TenderStatusResponse {
  tender_id: string;
  title: string;
  status: string;
  total_criteria: number;
  alerts_count: number;
  doc_hash: string | null;
  created_at: string;
}
