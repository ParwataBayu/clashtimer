'use client';
import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCOCStore } from '@/lib/store';
import type { Account, UpgradeTimer } from '@/lib/types';

interface StoreContextType {
  accounts: Account[];
  timers: UpgradeTimer[];
  hydrated: boolean;
  editingId?: string | null;
  startEditing?: (id: string) => void;
  stopEditing?: () => void;
  addAccount: (a: Account) => void;
  removeAccount: (id: string) => void;
  addTimers: (ts: UpgradeTimer[]) => void;
  removeTimer: (id: string) => void;
  markTimerDone: (id: string) => void;
  updateTimer: (id: string, patch: Partial<UpgradeTimer>) => void;
  removeAllDone: () => void;
}

export const StoreContext = createContext<StoreContextType>({
  accounts: [],
  timers: [],
  hydrated: false,
  editingId: null,
  startEditing: () => {},
  stopEditing: () => {},
  addAccount: () => {},
  removeAccount: () => {},
  addTimers: () => {},
  removeTimer: () => {},
  markTimerDone: () => {},
  updateTimer: () => {},
  removeAllDone: () => {},
});

export function useStore() {
  return useContext(StoreContext);
}

const NAV_TABS = [
  { label: 'Timer', href: '/', icon: TimerIcon },
  { label: 'Upload', href: '/upload-screen', icon: UploadIcon },
  { label: 'Akun', href: '/akun-management-screen', icon: ShieldIcon },
  { label: 'Setting', href: '/settings', icon: SettingsIcon },
];

function TimerIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      <line x1="10" x2="14" y1="2" y2="2"/>
      <line x1="12" x2="15" y1="14" y2="11"/>
      <circle cx="12" cy="14" r="8"/>
    </svg>
  );
}

function UploadIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ShieldIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function BellIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function XIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CrossedSwordsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
      <line x1="13" x2="19" y1="19" y2="13"/>
      <line x1="16" x2="20" y1="16" y2="20"/>
      <line x1="19" x2="21" y1="21" y2="19"/>
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
      <line x1="5" x2="9" y1="14" y2="18"/>
      <line x1="7" x2="4" y1="17" y2="20"/>
      <line x1="3" x2="5" y1="19" y2="21"/>
    </svg>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const store = useCOCStore();
  const pathname = usePathname();
  

  const activeCount = store.timers.filter((t) => t.status === 'active').length;
  const doneCount = store.timers.filter((t) => t.status === 'done').length;
  const totalCount = store.timers.length;

  return (
    <StoreContext.Provider value={store}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto" style={{ maxWidth: '520px', minHeight: '100vh' }}>
          <div
            className="app-header"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
              backgroundColor: 'var(--background)',
              // expose header height for child stickies (reduced for tighter spacing)
              ['--header-height' as any]: '160px',
              paddingBottom: 8,
              borderBottom: '1px solid transparent'
            }}
          >
            {/* Header */}
            <div className="px-4 pt-5 pb-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    boxShadow: '0 0 0 1px rgba(245,158,11,0.3)',
                  }}
                >
                  <CrossedSwordsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)', lineHeight: 1.2 }}>
                    ClashTimer
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Upgrade Timer Manager
                  </p>
                </div>
              </div>
            </div>

            {/* Divider under title */}
            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '8px 16px' }} />

            {/* Copyright / attribution */}
            <div className="px-4 pb-3 animate-fade-in">
              <div className="notification-banner flex items-center gap-2 px-3 py-2.5">
                <p className="text-xs flex-1" style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>
                  Dibuat dan dikembangkan oleh Invaders © 2026
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="px-4 pb-4">
              <div className="flex gap-3">
                {/* Sedang Upgrade */}
                <div className="stat-card">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d1cf39"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/>
                    <path d="m18 15 4-4"/>
                    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
                  </svg>
                  <span
                    className="text-2xl font-bold font-tabular"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {activeCount}
                  </span>
                  <span className="text-xs text-center" style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>
                    Sedang Upgrade
                  </span>
                </div>

                {/* Selesai */}
                <div className="stat-card">
                  <svg
                    className="w-5 h-5"
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
                  <span
                    className="text-2xl font-bold font-tabular"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {doneCount}
                  </span>
                  <span className="text-xs text-center" style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>
                    Selesai
                  </span>
                </div>

                {/* Total */}
                <div className="stat-card">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1b9ce7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 2h10"/>
                    <path d="M5 6h14"/>
                    <rect width="18" height="12" x="3" y="10" rx="2"/>
                  </svg>
                  <span
                    className="text-2xl font-bold font-tabular"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {totalCount}
                  </span>
                  <span className="text-xs text-center" style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>
                    Total
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 pb-2">
              <div
                className="flex gap-1 p-1 rounded-xl"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {NAV_TABS.map((tab) => {
                  const isActive =
                    tab.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(tab.href);
                  return (
                    <Link
                      key={`nav-tab-${tab.label}`}
                      href={tab.href}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive ? 'tab-active' : 'tab-inactive hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="px-4 pb-8">{children}</div>
        </div>
      </div>
    </StoreContext.Provider>
  );
}