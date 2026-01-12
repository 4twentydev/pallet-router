import type { PalletTask, JobGroup, FilterOptions } from '@/types/pallet';

/**
 * Groups pallets by Job# and Release#
 * @param pallets - Array of pallet tasks
 * @returns Array of job groups sorted by job and release number
 */
export function groupByJobAndRelease(pallets: PalletTask[]): JobGroup[] {
  // Create a map to group pallets
  const groupMap = new Map<string, PalletTask[]>();

  pallets.forEach(pallet => {
    const key = `${pallet.jobNumber}::${pallet.releaseNumber}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(pallet);
  });

  // Convert map to array of JobGroup objects
  const groups: JobGroup[] = [];
  groupMap.forEach((groupPallets, key) => {
    const [jobNumber, releaseNumber] = key.split('::');
    const completedCount = groupPallets.filter(p => p.made).length;
    const totalCount = groupPallets.length;

    groups.push({
      jobNumber,
      releaseNumber,
      pallets: groupPallets, // Preserve Excel row order (order they were entered)
      totalCount,
      completedCount,
      completionPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    });
  });

  // Sort groups by job number (numeric), then release number (numeric)
  return groups.sort((a, b) => {
    const aJob = parseInt(a.jobNumber, 10);
    const bJob = parseInt(b.jobNumber, 10);
    if (aJob !== bJob) return aJob - bJob;

    const aRelease = parseInt(a.releaseNumber, 10);
    const bRelease = parseInt(b.releaseNumber, 10);
    return aRelease - bRelease;
  });
}

/**
 * Filters pallets based on filter options
 * @param pallets - Array of pallet tasks
 * @param filters - Filter options
 * @returns Filtered array of pallet tasks
 */
export function filterPallets(pallets: PalletTask[], filters: FilterOptions): PalletTask[] {
  return pallets.filter(pallet => {
    // Search query filter (matches job, release, pallet, or size)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        pallet.jobNumber,
        pallet.releaseNumber,
        pallet.palletNumber,
        pallet.size,
        pallet.elevation,
        pallet.notes,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      if (filters.statusFilter === 'pending' && pallet.status !== 'pending') {
        return false;
      }
      if (filters.statusFilter === 'completed' && pallet.status !== 'completed') {
        return false;
      }
    }

    // Job filter (multi-select)
    if (filters.jobFilter.length > 0) {
      if (!filters.jobFilter.includes(pallet.jobNumber)) {
        return false;
      }
    }

    // Size filter (multi-select)
    if (filters.sizeFilter.length > 0) {
      if (!filters.sizeFilter.includes(pallet.size)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Gets unique values for a specific field from pallets array
 * @param pallets - Array of pallet tasks
 * @param field - Field name to extract unique values from
 * @returns Sorted array of unique values
 */
export function getUniqueValues(
  pallets: PalletTask[],
  field: keyof PalletTask
): string[] {
  const uniqueSet = new Set<string>();
  pallets.forEach(pallet => {
    const value = pallet[field];
    if (typeof value === 'string' && value) {
      uniqueSet.add(value);
    }
  });
  return Array.from(uniqueSet).sort((a, b) => {
    // Try numeric sort first
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    // Fall back to string sort
    return a.localeCompare(b);
  });
}

/**
 * Calculates overall completion statistics
 * @param pallets - Array of pallet tasks
 * @returns Object with completion statistics
 */
export function getCompletionStats(pallets: PalletTask[]) {
  const total = pallets.length;
  const completed = pallets.filter(p => p.made).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    percentage,
  };
}
