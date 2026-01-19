'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { addPallet } from '../actions/pallets';

interface AddPalletDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPalletDialog({ open, onClose, onSuccess }: AddPalletDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  // Form state matching the spreadsheet headers
  const [formData, setFormData] = useState({
    jobNumber: '',
    releaseNumber: '',
    palletNumber: '',
    size: '',
    elevation: '',
    accList: '',
    shippedDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.jobNumber || !formData.releaseNumber || !formData.palletNumber) {
      setError('Job Number, Release Number, and Pallet Number are required');
      return;
    }

    startTransition(async () => {
      const result = await addPallet({
        ...formData,
        made: false, // New pallets start as not made
      });

      if (result.success) {
        // Reset form and close dialog
        setFormData({
          jobNumber: '',
          releaseNumber: '',
          palletNumber: '',
          size: '',
          elevation: '',
          accList: '',
          shippedDate: '',
          notes: '',
        });
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'Failed to add pallet');
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl rounded-3xl border border-subtle bg-[color:var(--surface)] p-8 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-strong">Add New Pallet</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface-muted hover:text-strong"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Required Fields Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="jobNumber" className="block text-sm font-medium text-strong mb-1">
                    Job Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jobNumber"
                    type="text"
                    value={formData.jobNumber}
                    onChange={(e) => handleChange('jobNumber', e.target.value)}
                    className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="releaseNumber" className="block text-sm font-medium text-strong mb-1">
                    Release Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="releaseNumber"
                    type="text"
                    value={formData.releaseNumber}
                    onChange={(e) => handleChange('releaseNumber', e.target.value)}
                    className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="palletNumber" className="block text-sm font-medium text-strong mb-1">
                    Pallet Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="palletNumber"
                    type="text"
                    value={formData.palletNumber}
                    onChange={(e) => handleChange('palletNumber', e.target.value)}
                    className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Size and Elevation Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-strong mb-1">
                    Size
                  </label>
                  <input
                    id="size"
                    type="text"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    placeholder="e.g., 57x61, 48x96"
                    className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="elevation" className="block text-sm font-medium text-strong mb-1">
                    Elevation
                  </label>
                  <input
                    id="elevation"
                    type="text"
                    value={formData.elevation}
                    onChange={(e) => handleChange('elevation', e.target.value)}
                    className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Acc List */}
              <div>
                <label htmlFor="accList" className="block text-sm font-medium text-strong mb-1">
                  Accessories List
                </label>
                <input
                  id="accList"
                  type="text"
                  value={formData.accList}
                  onChange={(e) => handleChange('accList', e.target.value)}
                  className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                />
              </div>

              {/* Shipped Date */}
              <div>
                <label htmlFor="shippedDate" className="block text-sm font-medium text-strong mb-1">
                  Shipped Date
                </label>
                <input
                  id="shippedDate"
                  type="text"
                  value={formData.shippedDate}
                  onChange={(e) => handleChange('shippedDate', e.target.value)}
                  placeholder="e.g., 2024-01-15"
                  className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-strong mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-subtle bg-[color:var(--background)] px-4 py-2 text-sm text-strong transition-colors focus:border-accent-primary focus:outline-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="button-pad btn-primary flex-1 rounded-full text-sm font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Adding...' : 'Add Pallet'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="button-pad flex-1 rounded-full border border-subtle text-sm font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
