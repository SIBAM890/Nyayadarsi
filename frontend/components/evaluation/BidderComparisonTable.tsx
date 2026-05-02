import React, { memo } from 'react';
import type { BidderEvaluation } from '@/types/evaluation';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { Check, X, HelpCircle } from 'lucide-react';

interface BidderComparisonTableProps {
  bidders: BidderEvaluation[];
}

function BidderComparisonTableInner({ bidders }: BidderComparisonTableProps) {
  if (!bidders || bidders.length === 0) return null;

  // Extract all unique criteria from the first bidder (assuming all bidders share the same criteria)
  const criteriaList = bidders[0].verdicts?.map(v => v.criterion_id) || [];

  return (
    <div className="overflow-x-auto border border-white/[0.06] rounded-xl bg-surface-1">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-0 border-b border-white/[0.06]">
          <tr>
            <th className="p-4 font-medium text-nyaya-400 min-w-[200px]">Criteria</th>
            {bidders.map(bidder => (
              <th key={bidder.bidder_id} className="p-4 font-medium text-white min-w-[150px]">
                <div className="flex flex-col gap-2">
                  <span>{bidder.company_name}</span>
                  <VerdictBadge verdict={bidder.overall_verdict} />
                  {bidder.bid_amount && <span className="text-xs text-nyaya-400 font-normal">Bid: ₹{(bidder.bid_amount / 100000).toFixed(1)}L</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {criteriaList.map((criterionId, idx) => (
            <tr key={criterionId} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-4 text-nyaya-300">
                Criterion {idx + 1}
              </td>
              {bidders.map(bidder => {
                const verdictObj = bidder.verdicts?.find(v => v.criterion_id === criterionId);
                const verdict = verdictObj?.verdict || 'RED';
                
                return (
                  <td key={bidder.bidder_id} className="p-4">
                    <div className="flex items-center gap-2">
                      {verdict === 'GREEN' && <Check className="w-4 h-4 text-verdict-green" />}
                      {verdict === 'RED' && <X className="w-4 h-4 text-verdict-red" />}
                      {verdict === 'YELLOW' && <HelpCircle className="w-4 h-4 text-verdict-yellow" />}
                      <span className={`text-xs ${verdict === 'GREEN' ? 'text-verdict-green' : verdict === 'RED' ? 'text-verdict-red' : 'text-verdict-yellow'}`}>
                        {verdict}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const BidderComparisonTable = memo(BidderComparisonTableInner);
