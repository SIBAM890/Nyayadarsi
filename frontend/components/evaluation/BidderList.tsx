/**
 * BidderList — left panel listing all bidders with selection.
 */
import React, { memo, useCallback } from 'react';
import type { BidderEvaluation } from '@/types/evaluation';
import { VerdictBadge } from '@/components/ui/VerdictBadge';

interface BidderListProps {
  bidders: BidderEvaluation[];
  selectedBidderId: string | null;
  onSelect: (bidder: BidderEvaluation) => void;
}

interface BidderButtonProps {
  bidder: BidderEvaluation;
  isSelected: boolean;
  onSelect: (bidder: BidderEvaluation) => void;
}

const BidderButton = memo(function BidderButton({ bidder, isSelected, onSelect }: BidderButtonProps) {
  const handleClick = useCallback(() => onSelect(bidder), [bidder, onSelect]);
  return (
    <button
      onClick={handleClick}
      className={`w-full text-left glass-card-hover p-4 ${isSelected ? 'border-nyaya-500/40 bg-nyaya-600/10' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-white">{bidder.company_name}</span>
        <VerdictBadge verdict={bidder.overall_verdict} />
      </div>
      <p className="text-xs text-nyaya-400/40">{bidder.bidder_id} • {bidder.verdicts?.length || 0} criteria</p>
      {bidder.bid_amount && <p className="text-xs text-nyaya-300/50 mt-1">₹{(bidder.bid_amount / 100000).toFixed(1)}L</p>}
    </button>
  );
});

function BidderListInner({ bidders, selectedBidderId, onSelect }: BidderListProps) {
  return (
    <div className="space-y-3">
      <h4 className="section-title text-base">Bidders ({bidders.length})</h4>
      {bidders.map((bidder) => (
        <BidderButton key={bidder.bidder_id} bidder={bidder} isSelected={selectedBidderId === bidder.bidder_id} onSelect={onSelect} />
      ))}
    </div>
  );
}

export const BidderList = memo(BidderListInner);
