'use client';
import React, { useState, useRef, useCallback, useId } from 'react';
import type { ParsedItem, UpgradeType } from '@/lib/types';
import { getChatCompletion } from '@/lib/ai/chatCompletion';

interface OcrDropzoneProps {
  onParsed: (items: ParsedItem[]) => void;
  disabled?: boolean;
  upgradeType: UpgradeType;
}

async function fileToBase64DataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function parseGeminiResponse(text: string): Array<{ name: string; days: number; hours: number; minutes: number; seconds: number }> {
  const results: Array<{ name: string; days: number; hours: number; minutes: number; seconds: number }> = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Expected format: "Name: Xd Xh Xm Xs" or "Name | Xd Xh Xm Xs" or "Name - Xd Xh Xm Xs"
    const match = line.match(/^(.+?)[\s\-|:]+(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?$/i);
    if (!match) continue;

    const name = match[1].trim();
    const days = match[2] ? parseInt(match[2]) : 0;
    const hours = match[3] ? parseInt(match[3]) : 0;
    const minutes = match[4] ? parseInt(match[4]) : 0;
    const seconds = match[5] ? parseInt(match[5]) : 0;

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) continue;
    if (!name || name.length < 2) continue;

    results.push({ name, days, hours, minutes, seconds });
  }

  // Fallback: try JSON array format from Gemini
  if (results.length === 0) {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.name && (item.days || item.hours || item.minutes || item.seconds)) {
              results.push({
                name: String(item.name),
                days: Number(item.days) || 0,
                hours: Number(item.hours) || 0,
                minutes: Number(item.minutes) || 0,
                seconds: Number(item.seconds) || 0,
              });
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return results;
}

async function analyzeScreenshotWithGemini(file: File): Promise<Array<{ name: string; days: number; hours: number; minutes: number; seconds: number }>> {
  const base64DataUri = await fileToBase64DataUri(file);

  const prompt = `You are analyzing a Clash of Clans game screenshot. Your task is to find all active upgrade timers visible in the screenshot.

For each upgrade timer you find, extract:
1. The name of the building, hero, unit, spell, or equipment being upgraded
2. The remaining time in days (d), hours (h), minutes (m), seconds (s)

Return ONLY a plain text list, one item per line, in this exact format:
Name: Xd Xh Xm Xs

Rules:
- Only include items that are currently being upgraded (have a countdown timer)
- If a time component is 0, omit it (e.g. "2h 30m" not "0d 2h 30m 0s")
- Use the exact building/unit name shown in the game
- If no upgrade timers are visible, return: NONE

Example output:
Cannon: 2d 14h 30m
Barbarian King: 5d 2h
Lightning Spell: 6h 45m 20s`;

  const response = await getChatCompletion(
    'GEMINI',
    'gemini/gemini-2.5-flash',
    [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64DataUri } },
        ],
      },
    ],
    { temperature: 0.1, max_tokens: 1000 }
  );

  const content = response?.choices?.[0]?.message?.content ?? '';
  if (!content || content.trim().toUpperCase() === 'NONE') return [];

  return parseGeminiResponse(content);
}

export default function OcrDropzone({ onParsed, disabled, upgradeType }: OcrDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setTotalCount(files.length);
      setProcessedCount(0);

      const results: ParsedItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessedCount(i + 1);

        try {
          const upgrades = await analyzeScreenshotWithGemini(file);

          if (upgrades.length > 0) {
            for (const upgrade of upgrades) {
              results.push({
                id: `ocr-${Date.now()}-${i}-${results.length}`,
                name: upgrade.name,
                days: upgrade.days,
                hours: upgrade.hours,
                minutes: upgrade.minutes,
                seconds: upgrade.seconds,
              });
            }
          } else {
            // do not push placeholder entries when screenshot contains no upgrade timers
            // this keeps the UI from showing 'pasted image' items with zero time
          }
        } catch {
          results.push({
            id: `ocr-err-${Date.now()}-${i}`,
            name: `Screenshot ${i + 1} (gagal dibaca)`,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setIsProcessing(false);
      if (results.length > 0) {
        onParsed(results);
      } else {
        setError('Tidak ada waktu upgrade yang berhasil dibaca dari screenshot.');
      }
    },
    [onParsed, upgradeType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      processFiles(files);
    },
    [disabled, processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      processFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles]
  );

  return (
    <div>
      <label className="label-text" htmlFor={dropzoneId}>
        Upload Screenshot
      </label>
      <p className="helper-text mb-2">
        Upload screenshot COC — Gemini Vision AI akan membaca timer upgrade secara akurat.
      </p>

      <div
        id={dropzoneId}
        className={`upload-dropzone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ padding: '28px 16px', minHeight: '100px' }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled || isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-8 h-8 animate-spin"
              style={{ color: 'var(--primary)' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Gemini Vision menganalisis screenshot...
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {processedCount}/{totalCount} gambar ({progress}%)
              </p>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, backgroundColor: 'var(--border)', maxWidth: 200 }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
              className="w-10 h-10"
              style={{ color: 'var(--muted-foreground)' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Drag & drop atau klik untuk upload
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                PNG, JPG, WebP — bisa banyak sekaligus
              </p>
              <div
                className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--primary)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Powered by Gemini Vision AI
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}