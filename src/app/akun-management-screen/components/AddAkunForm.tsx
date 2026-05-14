'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/components/AppShell';
import type { Account } from '@/lib/types';
import { DOT_COLORS } from '@/lib/mockData';

interface AddAkunFormValues {
  name: string;
  thLevel: string;
}

interface AddAkunFormProps {
  onSuccess: () => void;
}

const TH_LEVELS = Array.from({ length: 17 }, (_, i) => i + 1);

export default function AddAkunForm({ onSuccess }: AddAkunFormProps) {
  const { accounts, addAccount } = useStore();
  const [selectedColor, setSelectedColor] = useState(DOT_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAkunFormValues>({
    defaultValues: { name: '', thLevel: '13' },
  });

  const onSubmit = async (data: AddAkunFormValues) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name: data.name.trim(),
      thLevel: parseInt(data.thLevel),
      dotColor: selectedColor,
    };

    addAccount(newAccount);
    // TODO: Insert to Supabase — supabase.from('accounts').insert(newAccount)

    setIsSaving(false);
    reset();
    onSuccess();
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        Tambah Akun Baru
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <div className="mb-3">
          <label className="label-text" htmlFor="akun-name">
            Nama Akun
          </label>
          <input
            id="akun-name"
            type="text"
            className="input-field"
            placeholder="Contoh: Bayu Invaders"
            {...register('name', {
              required: 'Nama akun wajib diisi',
              minLength: { value: 2, message: 'Nama minimal 2 karakter' },
              validate: (v) =>
                !accounts.find((a) => a.name.toLowerCase() === v.trim().toLowerCase()) ||
                'Nama akun sudah digunakan',
            })}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* TH Level */}
        <div className="mb-3">
          <label className="label-text" htmlFor="akun-th">
            Town Hall Level
          </label>
          <div className="relative">
            <select
              id="akun-th"
              className="select-field pr-10"
              {...register('thLevel', { required: true })}
            >
              {TH_LEVELS.map((th) => (
                <option key={`th-opt-${th}`} value={th.toString()}>
                  TH{th}
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
        </div>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="label-text">Warna Indikator</label>
          <div className="flex gap-2 flex-wrap">
            {DOT_COLORS.map((color, idx) => (
              <button
                key={`color-opt-${idx}`}
                type="button"
                onClick={() => setSelectedColor(color)}
                className="w-7 h-7 rounded-full transition-all duration-150 flex-shrink-0"
                style={{
                  backgroundColor: color,
                  outline: selectedColor === color ? `2px solid ${color}` : 'none',
                  outlineOffset: 2,
                  transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                }}
                aria-label={`Pilih warna ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={() => {
              reset();
              onSuccess();
            }}
          >
            Batal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Menyimpan...
              </span>
            ) : (
              'Simpan Akun'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}