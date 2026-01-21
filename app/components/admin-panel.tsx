'use client';

import { useState } from 'react';
import { addPallet, importPallets } from '../actions/pallets';
import { parseExcelFile, parseCSV } from '@/lib/import-utils';
import type { NewPallet } from '@/lib/db/schema';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual entry state
  const [formData, setFormData] = useState<NewPallet>({
    jobNumber: '',
    releaseNumber: '',
    palletNumber: '',
    size: '',
    elevation: '',
    made: false,
    accList: '',
    shippedDate: '',
    notes: '',
  });

  // Import state
  const [replaceAll, setReplaceAll] = useState(false);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await addPallet(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Pallet added successfully!' });
        // Reset form
        setFormData({
          jobNumber: '',
          releaseNumber: '',
          palletNumber: '',
          size: '',
          elevation: '',
          made: false,
          accList: '',
          shippedDate: '',
          notes: '',
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to add pallet' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      let pallets: NewPallet[];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        pallets = await parseExcelFile(buffer);
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        pallets = parseCSV(text);
      } else {
        setMessage({ type: 'error', text: 'Please upload a .xlsx, .xls, or .csv file' });
        setLoading(false);
        return;
      }

      const result = await importPallets(pallets, replaceAll);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully imported ${pallets.length} pallet${pallets.length !== 1 ? 's' : ''}!`,
        });
        // Reset file input
        e.target.value = '';
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to import pallets' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-accent-secondary px-6 py-2 font-medium text-white transition-all hover:bg-accent-secondary/90"
      >
        Admin Panel
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-subtle bg-[color:var(--surface)] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle p-6">
          <h2 className="text-xl font-semibold text-strong">Admin Panel</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted hover:text-strong"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-subtle">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'border-b-2 border-accent-primary text-accent-primary'
                : 'text-muted hover:text-strong'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-b-2 border-accent-primary text-accent-primary'
                : 'text-muted hover:text-strong'
            }`}
          >
            Import File
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {message.text}
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Job Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobNumber}
                    onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Release Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.releaseNumber}
                    onChange={(e) => setFormData({ ...formData, releaseNumber: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Pallet Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.palletNumber}
                    onChange={(e) => setFormData({ ...formData, palletNumber: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size || ''}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Elevation
                  </label>
                  <input
                    type="text"
                    value={formData.elevation || ''}
                    onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted">
                  Accessories List
                </label>
                <input
                  type="text"
                  value={formData.accList || ''}
                  onChange={(e) => setFormData({ ...formData, accList: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="made"
                  checked={formData.made}
                  onChange={(e) => setFormData({ ...formData, made: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="made" className="text-sm font-medium text-muted">
                  Mark as completed
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition-all hover:bg-accent-primary/90 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Pallet'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">
                  Upload File (XLSX or CSV)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileImport}
                  disabled={loading}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-accent-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-primary/90"
                />
                <p className="mt-2 text-xs text-muted">
                  Expected columns: Job Number, Release Number, Pallet Number, Size, Elevation, Made, Acc List, Shipped Date, Notes
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="replaceAll"
                  checked={replaceAll}
                  onChange={(e) => setReplaceAll(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="replaceAll" className="text-sm font-medium text-muted">
                  Replace all existing pallets
                </label>
              </div>

              {loading && (
                <div className="text-center text-sm text-muted">
                  Importing pallets...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
