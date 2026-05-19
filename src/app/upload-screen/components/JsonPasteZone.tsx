'use client';
import React, { useState, useCallback } from 'react';
import type { ParsedItem, UpgradeType } from '@/lib/types';
import {
  getBuildingName,
  getHeroName,
  getUnitName,
  getSpellName,
  getPetName,
  getTrapName,
} from '@/lib/cocData';

interface JsonPasteZoneProps {
  onParsed: (items: ParsedItem[]) => void;
  upgradeType: UpgradeType;
  disabled?: boolean;
}

interface CocEntry {
  data: number;
  lvl?: number;
  timer?: number; // seconds remaining for upgrade
  cnt?: number;
  helper_recurrent?: boolean;
  gear_up?: number;
  weapon?: number;
}

function secondsToComponents(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs };
}

function parseCocJson(raw: string, upgradeType: UpgradeType): ParsedItem[] {
  try {
    const data = JSON.parse(raw);
    const results: ParsedItem[] = [];
    let idx = 0;

    if (upgradeType === 'Bangunan') {
      // Read buildings, heroes and traps with timer field
      const buildings: CocEntry[] = data.buildings ?? [];
      const heroes: CocEntry[] = data.heroes ?? [];
      const traps: CocEntry[] = data.traps ?? [];

      for (const b of buildings) {
        if (!b.timer || b.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(b.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getBuildingName(b.data)} Lv.${b.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }

      for (const t of traps) {
        if (!t.timer || t.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(t.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getTrapName(t.data)} Lv.${t.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }

      for (const h of heroes) {
        if (!h.timer || h.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(h.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getHeroName(h.data)} Lv.${h.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }
    } else {
      // Lab mode: read units, siege machines, spells, pets with timer field
      const units: CocEntry[] = data.units ?? [];
      const units2: CocEntry[] = data.units2 ?? [];
      const siegeMachines: CocEntry[] = data.siege_machines ?? [];
      const spells: CocEntry[] = data.spells ?? [];
      const pets: CocEntry[] = data.pets ?? [];

      for (const u of [...units, ...units2]) {
        if (!u.timer || u.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(u.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getUnitName(u.data)} Lv.${u.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }

      for (const s of spells) {
        if (!s.timer || s.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(s.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getSpellName(s.data)} Lv.${s.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }

      for (const sm of siegeMachines) {
        if (!sm.timer || sm.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(sm.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getUnitName(sm.data)} Lv.${sm.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }

      for (const p of pets) {
        if (!p.timer || p.timer <= 0) continue;
        const { days, hours, minutes, seconds } = secondsToComponents(p.timer);
        results.push({
          id: `json-${Date.now()}-${idx++}`,
          name: `${getPetName(p.data)} Lv.${p.lvl ?? '?'}`,
          days,
          hours,
          minutes,
          seconds,
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

export default function JsonPasteZone({ onParsed, upgradeType, disabled }: JsonPasteZoneProps) {
  const [jsonText, setJsonText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    if (!jsonText.trim()) {
      setError('Paste JSON dari game COC terlebih dahulu.');
      return;
    }
    const items = parseCocJson(jsonText, upgradeType);
    if (items.length === 0) {
      setError(
        upgradeType === 'Bangunan'
          ? 'Tidak ada upgrade aktif ditemukan. Pastikan ada bangunan/hero dengan field "timer" di JSON.'
          : 'Tidak ada upgrade aktif ditemukan. Pastikan ada pasukan/mantra/siege_machines/pet dengan field "timer" di JSON.'
      );
      return;
    }
    setError(null);
    onParsed(items);
    setJsonText('');
    setExpanded(false);
  }, [jsonText, upgradeType, onParsed]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-150"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px dashed var(--border)',
          color: 'var(--muted-foreground)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Atau paste JSON dari game COC
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4 animate-slide-up"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Paste JSON COC
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setError(null);
              setJsonText('');
            }}
            className="icon-btn w-6 h-6"
            style={{ width: 24, height: 24, minWidth: 24 }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <textarea
        className="input-field font-mono text-xs"
        style={{ minHeight: 140, resize: 'vertical', fontFamily: 'monospace' }}
        placeholder='Paste JSON COC di sini... (format: {"buildings":[...],"heroes":[...],"units":[...],...})'
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setError(null);
        }}
      />

      {error && (
        <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}

      <p className="helper-text mb-3">
        {upgradeType === 'Bangunan'
          ? 'Mode Bangunan: membaca buildings & heroes yang sedang diupgrade (field "timer" > 0)'
          : 'Mode Lab: membaca pasukan, siege_machines, mantra, dan pet yang sedang diupgrade (field "timer" > 0)'}
      </p>

      <button
        type="button"
        onClick={handleParse}
        disabled={!jsonText.trim()}
        className="btn-primary w-full"
      >
        Parse JSON
      </button>
    </div>
  );
}