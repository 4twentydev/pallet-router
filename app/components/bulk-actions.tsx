'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onClear: () => void;
}

export default function BulkActions({
  selectedCount,
  onMarkComplete,
  onMarkIncomplete,
  onClear,
}: BulkActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="sticky top-4 z-10 rounded-3xl border border-subtle bg-[color:var(--surface)] p-5 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-strong">
          {selectedCount} pallet{selectedCount !== 1 ? 's' : ''} selected
        </p>

        <div className="flex gap-3">
          <button
            onClick={onMarkComplete}
            className="button-pad flex items-center gap-2 rounded-full bg-[color:var(--success)] text-sm font-semibold text-white transition-all hover:brightness-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Complete
          </button>
          <button
            onClick={onMarkIncomplete}
            className="button-pad flex items-center gap-2 rounded-full border border-subtle bg-[color:var(--surface)] text-sm font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
          >
            <XCircle className="h-4 w-4" />
            Mark Incomplete
          </button>
          <button
            onClick={onClear}
            className="button-pad-compact rounded-full border border-subtle bg-[color:var(--surface)] text-subtle transition-all hover:border-strong hover:text-strong"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
