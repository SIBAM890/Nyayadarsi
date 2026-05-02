/**
 * Evaluation types — mirrors backend/schemas/evaluation.py
 */

export type Verdict = 'GREEN' | 'YELLOW' | 'RED';

export interface CriterionResult {
  criterion_id: string;
  criterion: string | null;
  verdict: Verdict;
  confidence: number;
  extracted_value: number | null;
  source_document: string | null;
  source_page: number | null;
  source_cell: string | null;
  citation: string | null;
  flag_reason: string | null;
  ambiguity: string | null;
  mandatory: boolean | null;
  blocker: boolean | null;
  officer_options: string[] | null;
}

export interface BidderEvaluation {
  bidder_id: string;
  company_name: string;
  overall_verdict: Verdict;
  bid_amount?: number;
  verdicts: CriterionResult[];
}

export interface EvaluationData {
  tender_id: string;
  tender_title: string;
  bidders: BidderEvaluation[];
}

export interface OfficerDecisionPayload {
  tender_id: string;
  bidder_id: string;
  criterion_id: string;
  decision: 'PASS' | 'FAIL';
  reason: string;
  officer_id: string;
}

export interface OfficerDecisionResponse {
  logged: boolean;
  audit_hash: string;
  timestamp: string;
  decision: string;
  message: string;
}

export interface YellowQueueItem {
  bidder_id: string;
  company_name: string;
  criterion_id: string;
  criterion: string | null;
  flag_reason: string | null;
  verdict: string;
  confidence: number;
  ambiguity: string | null;
  mandatory: boolean | null;
  blocker: boolean | null;
  source_document: string | null;
  source_page: number | null;
  officer_options: string[] | null;
}

export interface YellowQueueResponse {
  tender_id: string;
  total_yellow: number;
  items: YellowQueueItem[];
}
