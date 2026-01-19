'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { togglePalletStatus, getPalletData } from '../actions/pallets';
import { filterPallets, groupByJobAndRelease } from '@/lib/excel/utils';
import type { PalletData, FilterOptions } from '@/types/pallet';
import FilterBar from './filter-bar';
import JobGroup from './job-group';
import AddPalletDialog from './add-pallet-dialog';

export default function PalletTracker({ initialData }: { initialData: PalletData }) {
  const [data, setData] = useState(initialData);
  const [optimisticData, updateOptimisticData] = useOptimistic(data);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    statusFilter: 'pending', // Default to pending
    jobFilter: [],
    sizeFilter: [],
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Apply filters and group pallets
  const filteredPallets = filterPallets(optimisticData.pallets, filters);
  const groupedPallets = groupByJobAndRelease(filteredPallets);

  const handleTogglePallet = async (palletId: string, currentStatus: boolean) => {
    console.log('[handleTogglePallet] Toggling:', palletId, 'from', currentStatus);

    startTransition(async () => {
      // Optimistic update
      updateOptimisticData((prev) => ({
        ...prev,
        pallets: prev.pallets.map((p) =>
          p.id === palletId
            ? { ...p, made: !currentStatus, status: !currentStatus ? 'completed' : 'pending' }
            : p
        ),
      }));

      console.log('[handleTogglePallet] Calling server action...');
      const result = await togglePalletStatus(palletId, currentStatus, data.metadata.version);
      console.log('[handleTogglePallet] Server action result:', result);

      if (result.success && result.data) {
        console.log('[handleTogglePallet] Success! Updating data...');
        setData(result.data);
      } else {
        console.error('[handleTogglePallet] Error:', result.error, result.message);
        setErrorMessage(result.message || 'An error occurred');
        // Show error and offer reload
        const errorMsg = result.message || 'An error occurred';
        if (window.confirm(`Error: ${errorMsg}\n\nClick OK to reload the page.`)) {
          window.location.reload();
        }
      }
    });
  };

  const handleAddPalletSuccess = async () => {
    // Refresh the data after adding a new pallet
    const freshData = await getPalletData();
    setData(freshData);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Add Pallet Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="button-pad btn-primary flex items-center gap-2 rounded-full text-sm font-semibold text-white transition-all hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
          Add Pallet
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        pallets={data.pallets}
      />

      {/* Job Groups */}
      <div className="flex flex-col gap-4">
        {groupedPallets.length === 0 ? (
          <div className="rounded-3xl border border-subtle bg-[color:var(--surface)] p-10 text-center shadow-sm">
            <p className="text-sm text-muted">
              No pallets found matching your filters.
            </p>
          </div>
        ) : (
          groupedPallets.map((group, i) => (
            <motion.div
              key={`${group.jobNumber}::${group.releaseNumber}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <JobGroup
                group={group}
                onTogglePallet={handleTogglePallet}
                isPending={isPending}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Add Pallet Dialog */}
      <AddPalletDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddPalletSuccess}
      />
    </div>
  );
}
