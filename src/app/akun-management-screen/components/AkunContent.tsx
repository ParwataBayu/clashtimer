'use client';
import React, { useState } from 'react';
import { useStore } from '@/components/AppShell';
import AddAkunForm from './AddAkunForm';
import AkunListItem from './AkunListItem';

export default function AkunContent() {
  const { accounts, removeAccount } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      removeAccount(id);
      setDeletingId(null);
      // TODO: Delete from Supabase — supabase.from('accounts').delete().eq('id', id)
    }, 300);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Akun COC
          </h2>
        </div>
        <button
          className="btn-primary flex items-center gap-1.5"
          style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          onClick={() => setShowAddForm((v) => !v)}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 animate-slide-up">
          <AddAkunForm onSuccess={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Account List */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: 'var(--muted-foreground)' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              Belum ada akun COC
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Tambah akun COC kamu untuk mulai tracking upgrade timer.
            </p>
          </div>
          <button
            className="btn-primary flex items-center gap-1.5"
            onClick={() => setShowAddForm(true)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Akun Pertama
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {accounts.map((account) => (
            <AkunListItem
              key={`akun-item-${account.id}`}
              account={account}
              onDelete={handleDelete}
              isDeleting={deletingId === account.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}