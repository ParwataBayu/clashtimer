'use client';
import React from 'react';
import type { ParsedItem } from '@/lib/types';

interface ParsedItemFormProps {
  item: ParsedItem;
  checked: boolean;
  onToggle: (id: string) => void;
  onChange: (updated: ParsedItem) => void;
  onRemove: (id: string) => void;
}

export default function ParsedItemForm({ item, checked, onToggle, onChange, onRemove }: ParsedItemFormProps) {
  const update = (field: keyof ParsedItem, value: string | number) => {
    onChange({
      ...item,
      [field]: typeof value === 'string' ? value : Math.max(0, Number(value) || 0),
    });
  };

  return (
    <div
      className="rounded-xl p-3 animate-slide-up transition-all duration-150"
      style={{
        backgroundColor: 'var(--card)',
        border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
        opacity: checked ? 1 : 0.6,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all duration-150"
          style={{
            backgroundColor: checked ? 'var(--primary)' : 'transparent',
            border: `2px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
          }}
          aria-label={checked ? 'Batalkan pilihan' : 'Pilih item ini'}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <input
          type="text"
          value={item.name}
          onChange={(e) => update('name', e.target.value)}
          className="input-field text-sm font-semibold"
          style={{ flex: 1, marginRight: 8, padding: '6px 10px' }}
          placeholder="Nama bangunan/item"
        />
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="icon-btn icon-btn-danger flex-shrink-0"
          aria-label="Hapus item ini"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(
          [
            { field: 'days', label: 'Hari' },
            { field: 'hours', label: 'Jam' },
            { field: 'minutes', label: 'Menit' },
            { field: 'seconds', label: 'Detik' },
          ] as { field: keyof ParsedItem; label: string }[]
        ).map(({ field, label }) => (
          <div key={`time-field-${item.id}-${field}`}>
            <label
              className="text-xs mb-1 block"
              style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}
            >
              {label}
            </label>
            <input
              type="number"
              min={0}
              value={item[field] as number}
              onChange={(e) => update(field, parseInt(e.target.value) || 0)}
              className="input-field font-tabular text-sm text-center"
              style={{ padding: '6px 4px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}