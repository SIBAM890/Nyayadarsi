/**
 * Audit types — mirrors backend/schemas/audit.py
 */

export interface AuditEntry {
  id: number;
  timestamp: string;
  entity_type: string;
  entity_id: string;
  action: string;
  sha256_input: string;
  sha256_output: string;
  model_version: string | null;
  officer_id: string | null;
  confidence: number | null;
  verdict: string | null;
  details_json: string | null;
}

export interface AuditTrailResponse {
  entity_id: string | null;
  total_entries: number;
  trail: AuditEntry[];
}
