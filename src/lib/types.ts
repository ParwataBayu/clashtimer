export type UpgradeType = 'Bangunan' | 'Lab';

export type UpgradeStatus = 'active' | 'done';

export interface Account {
  id: string;
  name: string;
  thLevel: number;
  dotColor: string;
  buildermultiplier?: number;
  labmultiplier?: number;
  ramuanB?: number;
  ramuanL?: number;
}

export interface UpgradeTimer {
  id: string;
  accountId: string;
  accountName: string;
  type: UpgradeType;
  name: string;
  finishAt: number; // Unix timestamp ms
  screenshotUrl?: string;
  status: UpgradeStatus;
  speedBoostStartTime?: number; // Unix timestamp ms when speed boost was activated
  speedBoostMultiplier?: number; // optional multiplier set per-timer (e.g. Tukang/Lab account-applied multiplier)
  // Ramuan-specific fields (separate from account-based boosts)
  // For Bangunan (house) ramuan
  ramuanBangunanSpeedBoostStartTime?: number;
  ramuanBangunanSpeedBoostMultiplier?: number;
  // For Lab ramuan
  ramuanLabSpeedBoostStartTime?: number;
  ramuanLabSpeedBoostMultiplier?: number;
}

export interface ParsedItem {
  id: string;
  name: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  type?: UpgradeType; // Optional: set when auto-detected from JSON
}