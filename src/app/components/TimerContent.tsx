'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/components/AppShell';
import TimerCard from './TimerCard';
import type { UpgradeTimer } from '@/lib/types';
 

export default function TimerContent() {
  const { accounts, timers, removeTimer, markTimerDone, removeAllDone, removeAllForAccount, removeActiveForAccount } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>('semua');
  const [accountViewType, setAccountViewType] = useState<'semua' | 'Bangunan' | 'Lab'>('semua');
  const [, forceUpdate] = useState(0);
  const [armedActive, setArmedActive] = useState(false);
  const [armedDone, setArmedDone] = useState(false);
  const armedActiveTimeout = useRef<number | null>(null);
  const armedDoneTimeout = useRef<number | null>(null);

  // Countdown tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (armedActiveTimeout.current) window.clearTimeout(armedActiveTimeout.current);
      if (armedDoneTimeout.current) window.clearTimeout(armedDoneTimeout.current);
    };
  }, []);

  const filterPills = [
    { id: 'semua', label: 'Semua' },
    ...accounts.map((a) => ({ id: a.id, label: a.name })),
  ];

  let filteredTimers: UpgradeTimer[] =
    activeFilter === 'semua'
      ? timers
      : timers.filter((t) => t.accountId === activeFilter);

  if (activeFilter !== 'semua' && accountViewType !== 'semua') {
    filteredTimers = filteredTimers.filter((t) => t.type === accountViewType);
  }

  const now = Date.now();

  // Notifications are scheduled in the store (precise timers), so no duplicate client detection here.

  const activeTimers = filteredTimers
    .filter((t) => t.status !== 'done' && t.finishAt > now)
    .sort((a, b) => a.finishAt - b.finishAt);

  const doneTimers = filteredTimers
    .filter((t) => t.status === 'done' || t.finishAt <= now)
    .sort((a, b) => a.finishAt - b.finishAt);

  const handleDelete = useCallback(
    (id: string) => {
      removeTimer(id);
    },
    [removeTimer]
  );

  if (timers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: 'var(--muted-foreground)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l2 2" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            Belum ada timer upgrade
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Upload screenshot atau paste JSON di tab Upload untuk mulai tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Filter Pills */}
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1"
        style={{ position: 'sticky', top: 'var(--header-height)', zIndex: 30, background: 'var(--background)', paddingTop: 6, marginTop: 4 }}
      >
        {filterPills.map((pill) => (
          <button
            key={`pill-${pill.id}`}
            onClick={() => setActiveFilter(pill.id)}
            className={activeFilter === pill.id ? 'account-pill-active' : 'account-pill-inactive'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Account-specific view toggle */}
      {activeFilter !== 'semua' && (
        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="flex items-center gap-2" style={{ marginLeft: 6 }}>
            {([
              { id: 'semua', label: 'Semua' },
              { id: 'Bangunan', label: 'Bangunan' },
              { id: 'Lab', label: 'Lab' },
            ] as { id: string; label: string }[]).map((opt) => (
              <button
                key={`accview-${opt.id}`}
                onClick={() => setAccountViewType(opt.id as any)}
                className={accountViewType === (opt.id as any) ? 'filter-pill-active' : 'filter-pill-inactive'}
                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 8 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Sedang Upgrade ({activeTimers.length})</p>
            {activeFilter !== 'semua' && (
              <button
                className={`text-xs btn-danger-soft px-3 py-1.5 rounded-lg ${armedActive ? 'btn-danger-soft-armed' : ''}`}
                onClick={() => {
                  if (!armedActive) {
                    setArmedActive(true);
                    if (armedActiveTimeout.current) window.clearTimeout(armedActiveTimeout.current);
                    armedActiveTimeout.current = window.setTimeout(() => setArmedActive(false), 5000);
                    return;
                  }
                  removeActiveForAccount(activeFilter);
                  setArmedActive(false);
                  if (armedActiveTimeout.current) {
                    window.clearTimeout(armedActiveTimeout.current);
                    armedActiveTimeout.current = null;
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span>Hapus semua</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {activeTimers.map((timer) => (
              <TimerCard
                key={`timer-active-${timer.id}`}
                timer={timer}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done Timers */}
      {doneTimers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">
              Selesai ({doneTimers.length})
            </p>
            <button
              className={`text-xs btn-danger-soft px-3 py-1.5 rounded-lg ${armedDone ? 'btn-danger-soft-armed' : ''}`}
              onClick={() => {
                if (!armedDone) {
                  setArmedDone(true);
                  if (armedDoneTimeout.current) window.clearTimeout(armedDoneTimeout.current);
                  armedDoneTimeout.current = window.setTimeout(() => setArmedDone(false), 5000);
                  return;
                }
                removeAllDone();
                setArmedDone(false);
                if (armedDoneTimeout.current) {
                  window.clearTimeout(armedDoneTimeout.current);
                  armedDoneTimeout.current = null;
                }
              }}
            >
              Hapus semua
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {doneTimers.map((timer) => (
              <TimerCard
                key={`timer-done-${timer.id}`}
                timer={timer}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {filteredTimers.length === 0 && timers.length > 0 && (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Tidak ada timer untuk akun ini.
          </p>
        </div>
      )}
    </div>
  );
}