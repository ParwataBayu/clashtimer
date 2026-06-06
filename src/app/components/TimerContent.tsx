'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/components/AppShell';
import TimerCard from './TimerCard';
import type { UpgradeTimer } from '@/lib/types';
import { isPetName } from '@/lib/cocData';
 

export default function TimerContent() {
  const { accounts, timers, removeTimer, markTimerDone, removeAllDone, removeAllForAccount, removeActiveForAccount, updateTimersBulk, updateAccount } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>('semua');
  const [accountViewType, setAccountViewType] = useState<'semua' | 'Bangunan' | 'Lab'>('semua');
  const [, forceUpdate] = useState(0);
  const [armedActive, setArmedActive] = useState(false);
  const [armedDone, setArmedDone] = useState(false);
  const [confirmRamuanB, setConfirmRamuanB] = useState(false);
  const [confirmRamuanL, setConfirmRamuanL] = useState(false);
  const confirmRamuanBTimeout = useRef<number | null>(null);
  const confirmRamuanLTimeout = useRef<number | null>(null);
  const [showRamuanBNotice, setShowRamuanBNotice] = useState(false);
  const [showRamuanLNotice, setShowRamuanLNotice] = useState(false);
  const ramuanBNoticeTimeout = useRef<number | null>(null);
  const ramuanLNoticeTimeout = useRef<number | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<'B' | 'L' | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    kind?: 'info' | 'success' | 'error';
    details?: Array<{ id: string; name: string; reducedMs: number; before: number; after: number }>;
  } | null>(null);

  function formatDuration(ms: number) {
    if (ms <= 0) return '0s';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const parts: string[] = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (!parts.length) parts.push(`${s % 60}s`);
    return parts.join(' ');
  }
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
      if (confirmRamuanBTimeout.current) window.clearTimeout(confirmRamuanBTimeout.current);
      if (confirmRamuanLTimeout.current) window.clearTimeout(confirmRamuanLTimeout.current);
      if (ramuanBNoticeTimeout.current) window.clearTimeout(ramuanBNoticeTimeout.current);
      if (ramuanLNoticeTimeout.current) window.clearTimeout(ramuanLNoticeTimeout.current);
    };
  }, []);

  const filterPills = [
    { id: 'semua', label: 'Semua' },
    ...accounts.map((a) => ({ id: a.id, label: a.name })),
  ];

  const accountViewOptions: { id: 'semua' | 'Bangunan' | 'Lab'; label: string }[] = [
    { id: 'semua', label: 'Semua' },
    { id: 'Bangunan', label: 'Bangunan' },
    { id: 'Lab', label: 'Lab' },
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

  // When viewing all timers, show combined Upgrade (active) first (soonest finish),
  // then Selesai (done) moved to the bottom.
  const combinedActiveTimers = filteredTimers
    .filter((t) => t.status !== 'done' && t.finishAt > now)
    .slice()
    .sort((a, b) => a.finishAt - b.finishAt);

  const combinedDoneTimers = filteredTimers
    .filter((t) => t.status === 'done' || t.finishAt <= now)
    .slice()
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
      {notification && (
        <div className="notification-banner mb-3" style={{ padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 9999, background: notification.kind === 'error' ? '#ef4444' : notification.kind === 'success' ? '#22c55e' : 'var(--primary)' }} />
              <div className="text-sm" style={{ color: 'var(--foreground)' }}>{notification.message}</div>
            </div>
            <button className="icon-btn" onClick={() => setNotification(null)} aria-label="Tutup notifikasi">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          {notification.details && notification.details.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <small style={{ color: 'var(--muted-foreground)' }}>{notification.details.length} entry affected</small>
            </div>
          )}
        </div>
      )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
        <>
          
        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="flex items-center gap-2" style={{ marginLeft: 6 }}>
            {accountViewOptions.map((opt) => (
              <button
                key={`accview-${opt.id}`}
                onClick={() => setAccountViewType(opt.id)}
                className={accountViewType === opt.id ? 'filter-pill-active' : 'filter-pill-inactive'}
                style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: 8 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        </>
      )}

      {/* Active / Combined Timers */}
      {activeFilter === 'semua' ? (
        <>
          {combinedActiveTimers.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="section-label">Upgrade ({combinedActiveTimers.length})</p>
              </div>
              <div className="flex flex-col gap-2">
                {combinedActiveTimers.map((timer) => (
                  <TimerCard key={`timer-all-active-${timer.id}`} timer={timer} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {combinedDoneTimers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="section-label">Selesai ({combinedDoneTimers.length})</p>
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
                  Hapus
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {combinedDoneTimers.map((timer) => (
                  <TimerCard key={`timer-all-done-${timer.id}`} timer={timer} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        activeTimers.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Upgrade ({activeTimers.length})</p>
              {activeFilter !== 'semua' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        title="Gunakan Ramuan Bangunan"
                        onMouseEnter={() => setHoveredIcon('B')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => {
                          const acc = accounts.find((a) => a.id === activeFilter);
                          const count = acc?.ramuanB ?? 0;
                          if (!count || count <= 0) {
                            // Clear the Lab notice if it's showing
                            if (ramuanLNoticeTimeout.current) window.clearTimeout(ramuanLNoticeTimeout.current);
                            setShowRamuanLNotice(false);
                            
                            setShowRamuanBNotice(true);
                            if (ramuanBNoticeTimeout.current) window.clearTimeout(ramuanBNoticeTimeout.current);
                            // show for 3s
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            ramuanBNoticeTimeout.current = window.setTimeout(() => setShowRamuanBNotice(false), 3000) as unknown as number;
                            return;
                          }
                          if (!confirmRamuanB) {
                            setConfirmRamuanB(true);
                            if (confirmRamuanBTimeout.current) window.clearTimeout(confirmRamuanBTimeout.current);
                            confirmRamuanBTimeout.current = window.setTimeout(() => setConfirmRamuanB(false), 8000) as unknown as number;
                            return;
                          }
                          setConfirmRamuanB(false);
                          if (confirmRamuanBTimeout.current) { window.clearTimeout(confirmRamuanBTimeout.current); confirmRamuanBTimeout.current = null; }
                          const nowLocal = Date.now();
                          const multiplier = 10 * (accounts.find((a) => a.id === activeFilter)?.ramuanB ?? 0);
                          const targets = timers.filter((t) => t.accountId === activeFilter && t.type === 'Bangunan' && t.status !== 'done' && t.finishAt > nowLocal);
                          const updates: Array<{ id: string; patch: Partial<UpgradeTimer> }> = [];
                          targets.forEach((t) => {
                            // Apply ramuanBangunan so it stacks with any existing Tukang/Lab boosts
                            updates.push({ id: t.id, patch: { ramuanBangunanSpeedBoostStartTime: nowLocal, ramuanBangunanSpeedBoostMultiplier: multiplier } });
                          });
                          if (updates.length > 0) updateTimersBulk(updates);
                          // consume ramuan from account (use all configured ramuan)
                          updateAccount(activeFilter, { ramuanB: 0 });
                        }}
                        className="p-2 rounded-md"
                        style={{ 
                          border: (hoveredIcon === 'B' || confirmRamuanB) ? '1px solid transparent' : '1px solid var(--border)', 
                          background: (hoveredIcon === 'B' || confirmRamuanB) ? 'rgba(28, 189, 253, 0.2)' : 'transparent', 
                          color: '#249adf', 
                          transition: 'transform 120ms, color 120ms, background-color 120ms, border-color 120ms' 
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house-plus-icon lucide-house-plus"><path d="M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35"/><path d="M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8"/><path d="M15 18h6"/><path d="M18 15v6"/></svg>
                      </button>
                      {showRamuanBNotice && (
                        <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: 'rgba(239,68,68,0.95)', color: '#fff', padding: '6px 8px', borderRadius: 8, fontSize: 12, whiteSpace: 'nowrap', zIndex: 60 }}>
                          Ramuan Bangunan Kosong
                        </div>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        title="Gunakan Ramuan Lab"
                        onMouseEnter={() => setHoveredIcon('L')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => {
                          const acc = accounts.find((a) => a.id === activeFilter);
                          const count = acc?.ramuanL ?? 0;
                          if (!count || count <= 0) {
                            // Clear the Bangunan notice if it's showing
                            if (ramuanBNoticeTimeout.current) window.clearTimeout(ramuanBNoticeTimeout.current);
                            setShowRamuanBNotice(false);
                            
                            setShowRamuanLNotice(true);
                            if (ramuanLNoticeTimeout.current) window.clearTimeout(ramuanLNoticeTimeout.current);
                            ramuanLNoticeTimeout.current = window.setTimeout(() => setShowRamuanLNotice(false), 3000) as unknown as number;
                            return;
                          }
                          if (!confirmRamuanL) {
                            setConfirmRamuanL(true);
                            if (confirmRamuanLTimeout.current) window.clearTimeout(confirmRamuanLTimeout.current);
                            confirmRamuanLTimeout.current = window.setTimeout(() => setConfirmRamuanL(false), 8000) as unknown as number;
                            return;
                          }

                          setConfirmRamuanL(false);
                          if (confirmRamuanLTimeout.current) { window.clearTimeout(confirmRamuanLTimeout.current); confirmRamuanLTimeout.current = null; }
                          const nowLocal = Date.now();
                          const multiplier = 24 * (accounts.find((a) => a.id === activeFilter)?.ramuanL ?? 0);
                          const targets = timers.filter((t) => t.accountId === activeFilter && t.type === 'Lab' && t.status !== 'done' && t.finishAt > nowLocal && !isPetName(t.name));
                          const updates: Array<{ id: string; patch: Partial<UpgradeTimer> }> = [];
                          targets.forEach((t) => {
                            updates.push({ id: t.id, patch: { ramuanLabSpeedBoostStartTime: nowLocal, ramuanLabSpeedBoostMultiplier: multiplier } });
                          });
                          if (updates.length > 0) updateTimersBulk(updates);
                          // consume ramuan from account (use all configured ramuan)
                          updateAccount(activeFilter, { ramuanL: 0 });
                        }}
                        className="p-2 rounded-md"
                        style={{ 
                          border: (hoveredIcon === 'L' || confirmRamuanL) ? '1px solid transparent' : '1px solid var(--border)', 
                          background: (hoveredIcon === 'L' || confirmRamuanL) ? 'rgba(165, 23, 106, 0.2)' : 'transparent', 
                          color: '#7a0b55',
                          transition: 'transform 120ms, color 120ms, background-color 120ms, border-color 120ms' 
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flask-conical-icon lucide-flask-conical"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>
                      </button>
                      {showRamuanLNotice && (
                        <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: 'rgba(239,68,68,0.95)', color: '#fff', padding: '6px 8px', borderRadius: 8, fontSize: 12, whiteSpace: 'nowrap', zIndex: 60 }}>
                          Ramuan Lab Kosong
                        </div>
                      )}
                    </div>
                  </div>

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
                    <span>Hapus</span>
                  </button>
                </div>
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
        )
      )}

      {/* Done Timers (account-specific only) */}
      {activeFilter !== 'semua' && doneTimers.length > 0 && (
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
              Hapus
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
    </div>
  );
}