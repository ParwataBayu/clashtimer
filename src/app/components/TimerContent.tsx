'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/components/AppShell';
import TimerCard from './TimerCard';
import type { UpgradeTimer } from '@/lib/types';
 

export default function TimerContent() {
  const { accounts, timers, removeTimer, markTimerDone, removeAllDone } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>('semua');
  const [, forceUpdate] = useState(0);

  // Countdown tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filterPills = [
    { id: 'semua', label: 'Semua' },
    ...accounts.map((a) => ({ id: a.id, label: a.name })),
  ];

  const filteredTimers: UpgradeTimer[] =
    activeFilter === 'semua'
      ? timers
      : timers.filter((t) => t.accountId === activeFilter);

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
            className={activeFilter === pill.id ? 'filter-pill-active' : 'filter-pill-inactive'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <div className="mb-5">
          <p className="section-label mb-2">
            Sedang Upgrade ({activeTimers.length})
          </p>
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
              className="text-xs btn-primary px-3 py-1.5 rounded-lg"
              onClick={() => {
                // remove all done timers immediately
                removeAllDone();
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