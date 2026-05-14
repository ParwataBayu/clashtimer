'use client';
import React, { useState } from 'react';
import type { Account } from '@/lib/types';

interface AkunListItemProps {
  account: Account;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function AkunListItem({ account, onDelete, isDeleting }: AkunListItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(account.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <div
      className="card-surface-hover flex items-center gap-3"
      style={{
        padding: '14px 16px',
        opacity: isDeleting ? 0 : 1,
        transform: isDeleting ? 'translateX(20px)' : 'translateX(0)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      {/* Colored Dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: account.dotColor }}
      />

      {/* Name + TH */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
          {account.name}
        </span>
        <span
          className="text-xs font-semibold flex-shrink-0 px-1.5 py-0.5 rounded-md"
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--muted-foreground)',
            fontSize: '0.7rem',
          }}
        >
          TH{account.thLevel}
        </span>
      </div>

      {/* Delete Button */}
      <button
        className={`icon-btn icon-btn-danger flex-shrink-0 ${confirmDelete ? '' : ''}`}
        style={
          confirmDelete
            ? { backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }
            : {}
        }
        aria-label={confirmDelete ? `Konfirmasi hapus ${account.name}` : `Hapus ${account.name}`}
        onClick={handleDeleteClick}
        title={confirmDelete ? 'Klik lagi untuk konfirmasi' : `Hapus ${account.name}`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}