'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Account, UpgradeTimer } from './types';
import { MOCK_ACCOUNTS, MOCK_TIMERS } from './mockData';
import { supabase, hasSupabaseConfig } from './supabaseClient';

const ACCOUNTS_KEY = 'coc_accounts';
const TIMERS_KEY = 'coc_timers';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently fail
  }
}

export function useCOCStore() {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [timers, setTimers] = useState<UpgradeTimer[]>(MOCK_TIMERS);
  const [hydrated, setHydrated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const storedAccounts = loadFromStorage<Account[]>(ACCOUNTS_KEY, MOCK_ACCOUNTS);
    const storedTimers = loadFromStorage<UpgradeTimer[]>(TIMERS_KEY, MOCK_TIMERS);
    setAccounts(storedAccounts);
    setTimers(storedTimers);

    // try to fetch from Supabase and merge (if configured)
    (async () => {
      if (!hasSupabaseConfig()) {
        setHydrated(true);
        return;
      }

      try {
        const { data: accData, error: accErr } = await supabase.from('accounts').select('*');
        if (!accErr && Array.isArray(accData) && accData.length > 0) {
          setAccounts(accData as Account[]);
          saveToStorage(ACCOUNTS_KEY, accData);
        }

        const { data: timersData, error: timersErr } = await supabase.from('timers').select('*');
        if (!timersErr && Array.isArray(timersData) && timersData.length > 0) {
          setTimers(timersData as UpgradeTimer[]);
          saveToStorage(TIMERS_KEY, timersData);
        }
      } catch (e) {
        // ignore supabase errors and proceed with localStorage
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persistAccounts = useCallback((next: Account[]) => {
    setAccounts(next);
    saveToStorage(ACCOUNTS_KEY, next);
    // Sync to Supabase when configured (best-effort, non-blocking)
    if (hasSupabaseConfig()) {
      (async () => {
        try {
          const { data, error } = await supabase.from('accounts').upsert(next);
          if (error) {
            // log supabase error to browser console for debugging
            // eslint-disable-next-line no-console
            console.error('Supabase upsert(accounts) error:', error);
          } else {
            // eslint-disable-next-line no-console
            console.debug('Supabase upsert(accounts) success', (data as any)?.length ?? 0);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Supabase upsert(accounts) exception:', e);
        }
      })();
    }
  }, []);

  const persistTimers = useCallback((next: UpgradeTimer[]) => {
    setTimers(next);
    saveToStorage(TIMERS_KEY, next);
    if (hasSupabaseConfig()) {
      (async () => {
        try {
          const { data, error } = await supabase.from('timers').upsert(next);
          if (error) {
            // eslint-disable-next-line no-console
            console.error('Supabase upsert(timers) error:', error);
          } else {
            // eslint-disable-next-line no-console
            console.debug('Supabase upsert(timers) success', (data as any)?.length ?? 0);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Supabase upsert(timers) exception:', e);
        }
      })();
    }

    // Best-effort: also notify server to persist timers using service role key
    (async () => {
      try {
        await fetch('/api/timers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Scheduling: map timerId -> timeoutId so we trigger notifications exactly at finishAt
  const scheduledRef = useRef<Record<string, number>>({});

  const sendNotificationServer = useCallback(async (t: UpgradeTimer) => {
    // New concise message format
    const payload = {
      text: `📢 Upgrade Selesai! \n \n✅ ${t.name} \n👤 Akun : ${t.accountName} \n \nBuka akun coc ${t.accountName} dan upgrade yang lain buruan! 🫵🏻`,
      timerId: t.id,
    };

    // retry with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch('/api/telegram/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        // if server updated DB, treat as success as well
        if (res.ok && (data?.ok || (data?.updated && data.updated.notifyData))) return true;
      } catch {
        // ignore and retry
      }
      // wait before next attempt
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }

    return false;
  }, []);

  const markTimerDone = useCallback((id: string) => {
    const next = timers.map((t) => (t.id === id ? { ...t, status: 'done' as const } : t));
    persistTimers(next);
  }, [timers, persistTimers]);

  const scheduleTimer = useCallback((t: UpgradeTimer) => {
    try {
      // clear existing
      if (scheduledRef.current[t.id]) {
        clearTimeout(scheduledRef.current[t.id]);
      }

      const now = Date.now();
      const delay = Math.max(0, t.finishAt - now);
      const id = window.setTimeout(async () => {
        // mark done locally
        markTimerDone(t.id);
        // send server notification (fire-and-forget)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sendNotificationServer(t);
        delete scheduledRef.current[t.id];
      }, delay);

      scheduledRef.current[t.id] = id as unknown as number;
    } catch {
      // ignore scheduling errors
    }
  }, [markTimerDone, sendNotificationServer]);
  const scheduleAll = useCallback((list: UpgradeTimer[]) => {
    list.forEach((t) => {
      if (t.status !== 'done') scheduleTimer(t);
    });
  }, [scheduleTimer]);

  const updateTimer = useCallback((id: string, patch: Partial<UpgradeTimer>) => {
    const next = timers.map((t) => (t.id === id ? { ...t, ...patch } : t));
    persistTimers(next);

    // reschedule updated timer if needed
    const updated = next.find((t) => t.id === id);
    if (updated && updated.status !== 'done') {
      scheduleTimer(updated);
    }
    // stop editing after update
    setEditingId((cur) => (cur === id ? null : cur));
  }, [timers, persistTimers, scheduleTimer]);

  const addAccount = useCallback(
    (account: Account) => {
      persistAccounts([...accounts, account]);
    },
    [accounts, persistAccounts]
  );

  const removeAccount = useCallback(
    (id: string) => {
      const nextAccounts = accounts.filter((a) => a.id !== id);
      const nextTimers = timers.filter((t) => t.accountId !== id);
      persistAccounts(nextAccounts);
      persistTimers(nextTimers);

      // Also remove from Supabase if configured (best-effort, non-blocking)
      if (hasSupabaseConfig()) {
        (async () => {
          try {
            await supabase.from('timers').delete().eq('accountId', id);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Supabase delete(timers) exception:', e);
          }
          try {
            await supabase.from('accounts').delete().eq('id', id);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Supabase delete(accounts) exception:', e);
          }
        })();
      }
    },
    [accounts, timers, persistAccounts, persistTimers]
  );

  const addTimers = useCallback(
    async (newTimers: UpgradeTimer[]) => {
      const combined = [...timers, ...newTimers];

      // Wait for server-side persistence so cron/backfill can rely on server copy.
      try {
        const res = await fetch('/api/timers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(combined),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          // If server returned data, use it; otherwise fallback to combined
          const serverTimers = data && data.data ? (data.data as UpgradeTimer[]) : combined;
          persistTimers(serverTimers);
          scheduleAll(serverTimers);
          return;
        }
      } catch (e) {
        // ignore and fallback to client-side persistence
      }

      // fallback: persist locally and schedule
      persistTimers(combined);
      scheduleAll(combined);
    },
    [timers, persistTimers, scheduleAll]
  );

  const removeTimer = useCallback(
    (id: string) => {
      const next = timers.filter((t) => t.id !== id);
      persistTimers(next);

      if (hasSupabaseConfig()) {
        (async () => {
          try {
            await supabase.from('timers').delete().eq('id', id);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Supabase delete(timer) exception:', e);
          }
        })();
      }
    },
    [timers, persistTimers]
  );

  const removeAllDone = useCallback(() => {
    const now = Date.now();
    const idsToRemove = timers.filter((t) => t.status === 'done' || t.finishAt <= now).map((t) => t.id);
    const next = timers.filter((t) => !(t.status === 'done' || t.finishAt <= now));
    persistTimers(next);

    if (hasSupabaseConfig() && idsToRemove.length > 0) {
      (async () => {
        try {
          await supabase.from('timers').delete().in('id', idsToRemove);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Supabase delete(timers) exception:', e);
        }
      })();
    }
  }, [timers, persistTimers]);

  // schedule timers on hydration
  useEffect(() => {
    if (!hydrated) return;
    scheduleAll(timers);
    // cleanup on unmount
    return () => {
      Object.values(scheduledRef.current).forEach((tid) => clearTimeout(tid as number));
      scheduledRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return {
    accounts,
    timers,
    hydrated,
    editingId,
    startEditing: (id: string) => setEditingId(id),
    stopEditing: () => setEditingId(null),
    addAccount,
    removeAccount,
    addTimers,
    removeTimer,
    markTimerDone,
    updateTimer,
    removeAllDone,
  };
}