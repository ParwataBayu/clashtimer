'use client';
import React, { useState, useEffect } from 'react';
import type { UpgradeTimer } from '@/lib/types';
import { msToComponents, pad } from '@/lib/timeUtils';
import { useStore } from '@/components/AppShell';

interface TimerCardProps {
  timer: UpgradeTimer;
  onDelete: (id: string) => void;
}

function TrashIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
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
  );
}

function ImageIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function TimerCard({ timer, onDelete }: TimerCardProps) {
  const { accounts, updateTimer, editingId, startEditing, stopEditing } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [editName, setEditName] = useState(timer.name);
  const initialMinutes = Math.max(0, Math.ceil((timer.finishAt - Date.now()) / 60000));
  const [editDays, setEditDays] = useState<number>(Math.floor(initialMinutes / (60 * 24)));
  const [editHours, setEditHours] = useState<number>(Math.floor((initialMinutes % (60 * 24)) / 60));
  const [editMinutes, setEditMinutes] = useState<number>(initialMinutes % 60);
  const [editSeconds, setEditSeconds] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      setRemaining(timer.finishAt - now);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [timer.finishAt]);

  useEffect(() => {
    const mins = Math.max(0, Math.ceil((timer.finishAt - Date.now()) / 1000 / 60));
    setEditName(timer.name);
    setEditDays(Math.floor(mins / (60 * 24)));
    setEditHours(Math.floor((mins % (60 * 24)) / 60));
    setEditMinutes(mins % 60);
    setEditSeconds(0);
  }, [timer]);

  const isDone = remaining !== null && (remaining <= 0 || timer.status === 'done');

  const { days, hours, minutes, seconds } = remaining !== null ? msToComponents(remaining) : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const account = accounts.find((a) => a.id === timer.accountId);
  const isWarning = remaining !== null && remaining > 0 && remaining <= 30 * 60 * 1000; // <= 30 minutes (yellow)
  const isAlmostDone = remaining !== null && remaining > 0 && remaining < 60 * 1000; // < 1 minute (red)
  const chipBg = isAlmostDone ? 'rgba(239,68,68,0.18)' : isWarning ? 'rgba(245,158,11,0.12)' : undefined;
  const chipColor = isAlmostDone ? '#ef4444' : isWarning ? 'var(--primary)' : undefined;
  

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(timer.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  const isEditing = editingId === timer.id;

  return (
    <div
      className={`card-surface animate-slide-up ${isDone ? 'timer-card-done' : isAlmostDone ? 'timer-card-urgent' : 'timer-card-active'}`}
      style={{
        padding: '14px 14px 14px 16px',
        border: isEditing ? '1px solid rgba(245,158,11,0.6)' : undefined,
        boxShadow: isEditing ? '0 6px 18px rgba(0,0,0,0.45)' : undefined,
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Badges Row */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="badge-account flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: account?.dotColor ?? 'var(--primary)' }} />
              <span style={{ color: account?.dotColor ?? 'var(--primary)', fontWeight: 600 }}>{timer.accountName}</span>
            </span>
            <span className="badge-type">{timer.type}</span>
          </div>

          {/* Building Name */}
          <p
            className="font-bold text-base leading-tight mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {timer.name}
          </p>

          {/* Time Chips or Done (or inline editor when editing) */}

          {isEditing ? (
            <div className="mt-2">
              <div className="mb-2">
                <label className="text-xs">Nama bangunan</label>
                <input
                  className="input-field w-full mt-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="text-xs">Sisa waktu</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1">
                    <input
                      type="number"
                      min={0}
                      className="input-field w-full text-center"
                      value={editDays}
                      onChange={(e) => setEditDays(Math.max(0, Number(e.target.value) || 0))}
                    />
                      <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Hari</div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="input-field w-full text-center"
                      value={editHours}
                      onChange={(e) => setEditHours(Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
                    />
                    <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Jam</div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      className="input-field w-full text-center"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                    />
                          <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Menit</div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      className="input-field w-full text-center"
                      value={editSeconds}
                      onChange={(e) => setEditSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                    />
                          <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Detik</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="btn-primary px-3 py-1.5 rounded-lg"
                  onClick={() => {
                    const totalSeconds = editSeconds + editMinutes * 60 + editHours * 3600 + editDays * 86400;
                    const newFinish = Date.now() + totalSeconds * 1000;
                    const newStatus: UpgradeTimer['status'] = newFinish <= Date.now() ? 'done' : 'active';
                    updateTimer?.(timer.id, { name: editName, finishAt: newFinish, status: newStatus });
                    stopEditing?.();
                  }}
                >
                  Simpan
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg btn-secondary"
                  onClick={() => {
                    // cancel and reset fields
                    const mins = Math.max(0, Math.ceil((timer.finishAt - Date.now()) / 1000 / 60));
                    setEditName(timer.name);
                    setEditDays(Math.floor(mins / (60 * 24)));
                    setEditHours(Math.floor((mins % (60 * 24)) / 60));
                    setEditMinutes(mins % 60);
                    setEditSeconds(0);
                    stopEditing?.();
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : remaining === null ? (
            <div className="flex items-center gap-1.5">
              <span className="time-chip opacity-50">--h</span>
              <span className="time-chip opacity-50">--j</span>
              <span className="time-chip opacity-50">--m</span>
              <span className="time-chip opacity-50">--d</span>
            </div>
          ) : isDone ? (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                Selesai!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <ClockIcon className="w-3.5 h-3.5" style={{ color: chipColor ?? 'var(--primary)' } as React.CSSProperties} />
              {days > 0 && (
                <span className="time-chip" style={{ color: chipColor, backgroundColor: chipBg }}>{days}h</span>
              )}
              {(days > 0 || hours > 0) && (
                <span className="time-chip" style={{ color: chipColor, backgroundColor: chipBg }}>{pad(hours)}j</span>
              )}
              <span className="time-chip" style={{ color: chipColor, backgroundColor: chipBg }}>{pad(minutes)}m</span>
              <span className="time-chip" style={{ color: chipColor, backgroundColor: chipBg }}>{pad(seconds)}d</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
              {/** show edit icon only for active timers */}
              {!isDone && (
                <button
                  className="icon-btn"
                  aria-label="Edit timer"
                  onClick={() => startEditing?.(timer.id)}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              )}
          <button
            className={`icon-btn icon-btn-danger ${confirmDelete ? 'bg-red-500/20' : ''}`}
            aria-label={confirmDelete ? 'Konfirmasi hapus' : 'Hapus timer'}
            onClick={handleDeleteClick}
            style={confirmDelete ? { backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' } : {}}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}