export type UpgradeType = 'Bangunan' | 'Lab';

export type UpgradeStatus = 'active' | 'done';

export interface Account {
  id: string;
  name: string;
  thLevel: number;
  dotColor: string;
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
}

export interface ParsedItem {
  id: string;
  name: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}