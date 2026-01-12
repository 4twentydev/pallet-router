'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { JobGroup as JobGroupType } from '@/types/pallet';
import PalletCard from './pallet-card';
import ProgressIndicator from './progress-indicator';

interface JobGroupProps {
  group: JobGroupType;
  onTogglePallet: (palletId: string, currentStatus: boolean) => void;
  isPending: boolean;
}

export default function JobGroup({
  group,
  onTogglePallet,
  isPending,
}: JobGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="section-pad rounded-3xl border border-subtle bg-[color:var(--surface)] shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted" />
          ) : (
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-strong">
              Job {group.jobNumber} - Release {group.releaseNumber}
            </h2>
            <p className="text-sm text-muted">
              {group.completedCount} of {group.totalCount} pallets completed
            </p>
          </div>
        </div>

        <ProgressIndicator percentage={group.completionPercentage} />
      </button>

      {/* Pallet List */}
      {isExpanded && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {group.pallets.map((pallet) => (
            <PalletCard
              key={pallet.id}
              pallet={pallet}
              onToggleStatus={() => onTogglePallet(pallet.id, pallet.made)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}
