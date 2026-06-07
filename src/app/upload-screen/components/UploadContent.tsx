'use client';
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/components/AppShell';
import type { ParsedItem, UpgradeType, UpgradeTimer } from '@/lib/types';
import { formatFinishAt } from '@/lib/timeUtils';
import ParsedItemForm from './ParsedItemForm';
import OcrDropzone from './OcrDropzone';
import JsonPasteZone from './JsonPasteZone';

interface UploadFormValues {
  accountId: string;
}

export default function UploadContent() {
  const { accounts, addTimers } = useStore();
  const [upgradeType, setUpgradeType] = useState<UpgradeType>('Bangunan');
  const [sourceType, setSourceType] = useState<'ocr' | 'json' | null>(null); // Track source type
  const [activeTab, setActiveTab] = useState<'json' | 'ocr'>('json'); // Active upload tab
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editedItems, setEditedItems] = useState<ParsedItem[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [pendingOcrCallback, setPendingOcrCallback] = useState<((type: UpgradeType) => void) | null>(null);

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<UploadFormValues>({
    defaultValues: { accountId: '' },
  });

  const selectedAccountId = watch('accountId');
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleParsed = useCallback((items: ParsedItem[]) => {
    setParsedItems(items);
    setEditedItems(items);
    // Auto-select all items
    setCheckedIds(new Set(items.map((i) => i.id)));
    setSaveSuccess(false);
    
    // Determine source type: if items have type field (auto-detected), it's from JSON
    const isFromJson = items.length > 0 && items[0].type !== undefined;
    setSourceType(isFromJson ? 'json' : 'ocr');
  }, []);

  // Handle tab change - reset parsed items when switching between JSON and OCR
  const handleTabChange = useCallback((tab: 'json' | 'ocr') => {
    setActiveTab(tab);
    setParsedItems([]);
    setEditedItems([]);
    setCheckedIds(new Set());
    setSourceType(null);
    setSaveSuccess(false);
  }, []);

  // Handle OCR type selection from modal
  const handleOcrTypeSelected = useCallback((type: UpgradeType) => {
    setUpgradeType(type);
    setShowTypeModal(false);
    if (pendingOcrCallback) {
      pendingOcrCallback(type);
      setPendingOcrCallback(null);
    }
  }, [pendingOcrCallback]);

  // Callback for OcrDropzone to check type before processing
  const handleBeforeOcrProcess = useCallback((callback: (type: UpgradeType) => void) => {
    setPendingOcrCallback(() => callback);
    setShowTypeModal(true);
  }, []);

  const handleItemChange = useCallback((updated: ParsedItem) => {
    setEditedItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setEditedItems((prev) => prev.filter((item) => item.id !== id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setCheckedIds(new Set(editedItems.map((i) => i.id)));
  }, [editedItems]);

  const handleDeselectAll = useCallback(() => {
    setCheckedIds(new Set());
  }, []);

  const selectedItems = editedItems.filter((i) => checkedIds.has(i.id));
  const allSelected = editedItems.length > 0 && checkedIds.size === editedItems.length;

  const handleSave = async () => {
    if (!selectedAccountId || selectedItems.length === 0) return;
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newTimers: UpgradeTimer[] = selectedItems.map((item) => ({
      id: `timer-${Date.now()}-${item.id}`,
      accountId: selectedAccountId,
      accountName: selectedAccount?.name ?? 'Unknown',
      // Use item.type if available (from JSON auto-detection), otherwise use selected upgradeType (from OCR)
      type: item.type ?? upgradeType,
      name: item.name,
      finishAt: formatFinishAt(item.days, item.hours, item.minutes, item.seconds),
      status: 'active' as const,
    }));

    addTimers(newTimers);

    setIsSaving(false);
    setSaveSuccess(true);
    setParsedItems([]);
    setEditedItems([]);
    setCheckedIds(new Set());
    setSourceType(null);
  };

  const hasItems = editedItems.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="w-5 h-5"
          style={{ color: 'var(--primary)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Upload JSON atau Screenshot
        </h2>
      </div>

      {/* Account Selector */}
      <div className="mb-5">
        <label className="label-text" htmlFor="accountId">
          Pilih Akun
        </label>
        <div className="relative">
          <select
            id="accountId"
            className="select-field pr-10"
            {...register('accountId', { required: 'Pilih akun terlebih dahulu' })}
          >
            <option value="" disabled>
              Pilih akun...
            </option>
            {accounts.map((account) => (
              <option key={`opt-acc-${account.id}`} value={account.id}>
                {account.name} (TH{account.thLevel})
              </option>
            ))}
          </select>
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        {errors.accountId && (
          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
            {errors.accountId.message}
          </p>
        )}
        {accounts.length === 0 && (
          <p className="helper-text">
            Belum ada akun. Tambah akun di tab Akun terlebih dahulu.
          </p>
        )}
      </div>

      {/* Upload Tabs Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('json')}
          className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: activeTab === 'json' ? 'var(--primary)' : 'var(--muted)',
            color: activeTab === 'json' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            border: activeTab === 'json' ? 'none' : '1px solid var(--border)',
          }}
        >
          Paste Code JSON
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('ocr')}
          className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: activeTab === 'ocr' ? 'var(--primary)' : 'var(--muted)',
            color: activeTab === 'ocr' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            border: activeTab === 'ocr' ? 'none' : '1px solid var(--border)',
          }}
        >
          Upload Screenshot
        </button>
      </div>

      {/* JSON Input Zone - Only visible when JSON tab is active */}
      {activeTab === 'json' && (
        <div className="mb-6 animate-slide-up">
          <JsonPasteZone
            onParsed={handleParsed}
            disabled={!selectedAccountId}
          />
        </div>
      )}

      {/* OCR Input Zone - Only visible when OCR tab is active */}
      {activeTab === 'ocr' && (
        <div className="mb-6 animate-slide-up">
          <OcrDropzone
            onParsed={handleParsed}
            disabled={!selectedAccountId}
            upgradeType={upgradeType}
            onBeforeProcess={handleBeforeOcrProcess}
          />
        </div>
      )}

      {/* Type Selection Modal for OCR */}
      {showTypeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            paddingBottom: '20%',
          }}
          onClick={() => setShowTypeModal(false)}
        >
          <div
            className="rounded-xl p-6 max-w-sm"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Pilih Tipe Upgrade
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Sebelum mengunggah screenshot, pilih apakah upgrade ini untuk Bangunan atau Lab.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleOcrTypeSelected('Bangunan')}
                className="type-toggle-inactive"
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4"
                    style={{ color: 'var(--primary)' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35"/>
                    <path d="M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8"/>
                    <path d="M15 18h6"/>
                    <path d="M18 15v6"/>
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                    Bangunan
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOcrTypeSelected('Lab')}
                className="type-toggle-inactive"
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4"
                    style={{ color: '#7a0b55' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>
                    <path d="M6.453 15h11.094"/>
                    <path d="M8.5 2h7"/>
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: '#7a0b55' }}>
                    Lab
                  </span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTypeModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Type Toggle - Only shown when OCR is used (after results) */}
      {sourceType === 'ocr' && (
        <div className="mb-5 mt-5">
          <label className="label-text">Tipe Upgrade</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUpgradeType('Bangunan')}
              className={upgradeType === 'Bangunan' ? 'type-toggle-active' : 'type-toggle-inactive'}
              style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  style={{ color: upgradeType === 'Bangunan' ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35"/>
                  <path d="M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8"/>
                  <path d="M15 18h6"/>
                  <path d="M18 15v6"/>
                </svg>
                <span
                  className="text-sm font-semibold"
                  style={{ color: upgradeType === 'Bangunan' ? 'var(--primary)' : 'var(--foreground)' }}
                >
                  Upgrade Bangunan
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Builder sedang upgrade
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUpgradeType('Lab')}
              className={upgradeType === 'Lab' ? 'type-toggle-active' : 'type-toggle-inactive'}
              style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4"
                  style={{ color: upgradeType === 'Lab' ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>
                  <path d="M6.453 15h11.094"/>
                  <path d="M8.5 2h7"/>
                </svg>
                <span
                  className="text-sm font-semibold"
                  style={{ color: upgradeType === 'Lab' ? 'var(--primary)' : 'var(--foreground)' }}
                >
                  Upgrade Lab
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Laboratory dan pet sedang upgrade
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Parsed Items with Checkbox Selection */}
      {hasItems && (
        <div className="mt-5 animate-slide-up">
          {/* Header with select controls */}
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">
              Hasil Pembacaan ({editedItems.length} item)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={allSelected ? handleDeselectAll : handleSelectAll}
                className="text-xs font-medium transition-colors duration-150"
                style={{ color: 'var(--primary)' }}
              >
                {allSelected ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            </div>
          </div>

          {/* Selection summary */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--foreground)' }}>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>{checkedIds.size}</span>
              {' '}dari{' '}
              <span className="font-semibold">{editedItems.length}</span>
              {' '}item dipilih untuk disimpan
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {editedItems.map((item) => (
              <ParsedItemForm
                key={`parsed-${item.id}`}
                item={item}
                checked={checkedIds.has(item.id)}
                onToggle={handleToggleCheck}
                onChange={handleItemChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {saveSuccess ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                {selectedItems.length} timer berhasil ditambahkan!
              </span>
            </div>
          ) : (
            <button
              className="btn-primary w-full"
              onClick={handleSave}
              disabled={isSaving || !selectedAccountId || selectedItems.length === 0}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                `Simpan ${selectedItems.length} Timer yang Dipilih`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}