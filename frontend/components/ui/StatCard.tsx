/**
 * StatCard — clean stat display card with Lucide icon support.
 */
import React, { memo, type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string | ReactNode;
}

function StatCardInner({ label, value, icon }: StatCardProps) {
  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-nyaya-400 font-medium uppercase tracking-wider">{label}</span>
        {icon && (
          <span className="text-nyaya-500">
            {typeof icon === 'string' ? icon : icon}
          </span>
        )}
      </div>
      <p className="stat-value">{value}</p>
    </div>
  );
}

export const StatCard = memo(StatCardInner);
