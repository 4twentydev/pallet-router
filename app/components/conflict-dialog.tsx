'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConflictDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onReload: () => void;
}

export default function ConflictDialog({ open, message, onClose, onReload }: ConflictDialogProps) {
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
            className="relative w-full max-w-md rounded-3xl border border-subtle bg-[color:var(--surface)] p-8 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-strong">File Updated Externally</h2>
                <p className="mt-2 text-sm text-muted">
                  {message ||
                    'The Excel file has been modified outside this app. Your changes may conflict with recent updates.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onReload}
                className="button-pad btn-primary flex-1 rounded-full text-sm font-semibold text-white transition-all hover:brightness-95"
              >
                Reload Data
              </button>
              <button
                onClick={onClose}
                className="button-pad flex-1 rounded-full border border-subtle text-sm font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
