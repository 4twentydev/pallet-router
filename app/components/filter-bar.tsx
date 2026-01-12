'use client';

import { Search } from 'lucide-react';
import type { PalletTask, FilterOptions } from '@/types/pallet';
import { getUniqueValues, getCompletionStats } from '@/lib/excel/utils';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  pallets: PalletTask[];
}

export default function FilterBar({ filters, onChange, pallets }: FilterBarProps) {
  const uniqueJobs = getUniqueValues(pallets, 'jobNumber');
  const uniqueSizes = getUniqueValues(pallets, 'size');
  const stats = getCompletionStats(pallets);

  const tabBase = 'button-pad rounded-full text-sm font-semibold transition-all';
  const tabInactive =
    'border border-subtle bg-[color:var(--surface)] text-subtle hover:border-strong hover:text-strong';

  return (
    <section className="section-pad rounded-3xl border border-subtle bg-[color:var(--surface)] shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Tabs and Stats */}
        <div className="flex items-center justify-between">
          {/* View Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...filters, statusFilter: 'pending' })}
              className={`${tabBase} ${
                filters.statusFilter === 'pending'
                  ? 'btn-primary hover:brightness-95'
                  : tabInactive
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => onChange({ ...filters, statusFilter: 'completed' })}
              className={`${tabBase} ${
                filters.statusFilter === 'completed'
                  ? 'bg-[color:var(--success)] text-white hover:brightness-95'
                  : tabInactive
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => onChange({ ...filters, statusFilter: 'all' })}
              className={`${tabBase} ${
                filters.statusFilter === 'all'
                  ? 'bg-[color:var(--accent-secondary)] text-white hover:brightness-95'
                  : tabInactive
              }`}
            >
              All ({stats.total})
            </button>
          </div>

          {/* Completion Stats */}
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {stats.percentage}% Complete
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by job, pallet, size, or notes..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full rounded-2xl border border-subtle bg-transparent py-3 pl-11 pr-4 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
          />
        </div>

        {/* Clear Search Button */}
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="button-pad-compact self-start rounded-full border border-subtle bg-[color:var(--surface)] text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
          >
            Clear Search
          </button>
        )}
      </div>
    </section>
  );
}
