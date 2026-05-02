/**
 * StatCard — reusable glassmorphic stat display card.
 */
import React, { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

function StatCardInner({ label, value, icon }: StatCardProps) {
  return (
    <div className="glass-card p-4 text-center">
      {icon && <p className="text-2xl mb-1">{icon}</p>}
      <p className="stat-value text-2xl">{value}</p>
      <p className="text-xs text-nyaya-400/50 mt-1">{label}</p>
    </div>
  );
}

export const StatCard = memo(StatCardInner);
