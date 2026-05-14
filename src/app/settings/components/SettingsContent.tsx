'use client';
import React, { useState, useEffect } from 'react';

const TELEGRAM_TOKEN_KEY = 'coc_telegram_bot_token';
const TELEGRAM_CHAT_ID_KEY = 'coc_telegram_chat_id';

function loadSetting(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function saveSetting(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function SettingsContent() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    setBotToken(loadSetting(TELEGRAM_TOKEN_KEY));
    setChatId(loadSetting(TELEGRAM_CHAT_ID_KEY));
  }, []);

  const handleSave = () => {
    saveSetting(TELEGRAM_TOKEN_KEY, botToken.trim());
    saveSetting(TELEGRAM_CHAT_ID_KEY, chatId.trim());
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({ ok: false, message: 'Isi Bot Token dan Chat ID terlebih dahulu.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: '✅ ClashTimer: Notifikasi Telegram berhasil dikonfigurasi! Kamu akan menerima pesan saat upgrade selesai.',
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, message: 'Pesan test berhasil dikirim ke Telegram!' });
      } else {
        setTestResult({ ok: false, message: `Gagal: ${data.description ?? 'Unknown error'}` });
      }
    } catch {
      setTestResult({ ok: false, message: 'Gagal menghubungi Telegram API. Cek koneksi internet.' });
    }
    setTesting(false);
  };

  const hasConfig = botToken.trim().length > 0 && chatId.trim().length > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          style={{ color: 'var(--primary)' }}
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
        <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Pengaturan
        </h2>
      </div>

      {/* Telegram Section */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Section title */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #229ED9 0%, #1a7ab5 100%)' }}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Notifikasi Telegram Bot
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Terima pesan saat upgrade selesai
            </p>
          </div>
        </div>

        {/* How to get token info */}
        <div
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--primary)' }}>
            Cara mendapatkan Bot Token &amp; Chat ID:
          </p>
          <ol className="text-xs space-y-1" style={{ color: 'var(--muted-foreground)' }}>
            <li>1. Buka Telegram, cari <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>@BotFather</span></li>
            <li>2. Ketik <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>/newbot</span> dan ikuti instruksinya</li>
            <li>3. Salin <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Bot Token</span> yang diberikan BotFather</li>
            <li>4. Mulai chat dengan bot kamu, lalu cari <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>@userinfobot</span> untuk mendapatkan Chat ID</li>
          </ol>
        </div>

        {/* Bot Token Input */}
        <div className="mb-3">
          <label className="label-text" htmlFor="bot-token">
            Bot Token
          </label>
          <div className="relative">
            <input
              id="bot-token"
              type={showToken ? 'text' : 'password'}
              value={botToken}
              onChange={(e) => {
                setBotToken(e.target.value);
                setSaved(false);
                setTestResult(null);
              }}
              className="input-field pr-10"
              placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showToken ? 'Sembunyikan token' : 'Tampilkan token'}
            >
              {showToken ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <p className="helper-text">Token dari @BotFather</p>
        </div>

        {/* Chat ID Input */}
        <div className="mb-4">
          <label className="label-text" htmlFor="chat-id">
            Chat ID
          </label>
          <input
            id="chat-id"
            type="text"
            value={chatId}
            onChange={(e) => {
              setChatId(e.target.value);
              setSaved(false);
              setTestResult(null);
            }}
            className="input-field"
            placeholder="123456789"
            autoComplete="off"
          />
          <p className="helper-text">ID chat/grup tujuan notifikasi</p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg mb-3"
            style={{
              backgroundColor: testResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {testResult.ok ? (
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <p className="text-xs" style={{ color: testResult.ok ? '#22c55e' : '#ef4444' }}>
              {testResult.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !hasConfig}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: hasConfig ? 'var(--foreground)' : 'var(--muted-foreground)',
              cursor: !hasConfig || testing ? 'not-allowed' : 'pointer',
              opacity: !hasConfig ? 0.5 : 1,
            }}
          >
            {testing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Mengirim...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Test Kirim
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Tersimpan!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Simpan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: hasConfig ? '#22c55e' : 'var(--muted-foreground)' }}
        />
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {hasConfig
            ? 'Telegram bot terkonfigurasi — notifikasi akan dikirim saat upgrade selesai'
            : 'Telegram bot belum dikonfigurasi — isi Bot Token dan Chat ID di atas'}
        </p>
      </div>
    </div>
  );
}
