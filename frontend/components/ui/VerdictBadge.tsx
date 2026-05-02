/**
 * VerdictBadge — displays a colored badge for GREEN/YELLOW/RED verdicts.
 */
import React, { memo } from 'react';
import type { Verdict } from '@/types/evaluation';

interface VerdictBadgeProps {
  verdict: Verdict;
}

const BADGE_CLASS: Record<Verdict, string> = {
  GREEN: 'badge-green',
  YELLOW: 'badge-yellow',
  RED: 'badge-red',
};

function VerdictBadgeInner({ verdict }: VerdictBadgeProps) {
  return <span className={BADGE_CLASS[verdict]}>{verdict}</span>;
}

export const VerdictBadge = memo(VerdictBadgeInner);
