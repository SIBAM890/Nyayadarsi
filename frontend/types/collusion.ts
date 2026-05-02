/**
 * Collusion types — mirrors backend/schemas/collusion.py
 */

export type CollusionFlagName =
  | 'BID_CLUSTERING'
  | 'CA_FINGERPRINT'
  | 'SHARED_ADDRESS'
  | 'OWNERSHIP_NETWORK'
  | 'DOC_QUALITY_ASYMMETRY';

export interface CollusionEvidence {
  interpretation?: string;
  matching_features?: string[];
  bids?: BidItem[];
  bidders?: string[];
}

export interface CollusionFlag {
  flag: CollusionFlagName;
  triggered: boolean;
  cv_percent?: number;
  similarity_score?: number;
  reason?: string;
  mean_bid?: number;
  bid_spread?: number;
  probability_by_chance?: string;
  evidence?: CollusionEvidence;
}

export interface CollusionReportResponse {
  tender_id: string;
  flags: CollusionFlag[];
  total_triggered: number;
  generated_at: string;
}

export interface BidItem {
  bidder: string;
  amount: number;
}

export interface CollusionRequest {
  tender_id: string;
  bids: BidItem[];
}
