import type { Account, UpgradeTimer } from './types';

const now = Date.now();
const m = 60_000;
const h = 3_600_000;
const d = 86_400_000;

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-001', name: 'Bayu Invaders', thLevel: 13, dotColor: '#22c55e' },
  { id: 'acc-002', name: 'Par-Ba Invaders', thLevel: 14, dotColor: '#3b82f6' },
  { id: 'acc-003', name: 'Invaders', thLevel: 12, dotColor: '#f59e0b' },
];

export const MOCK_TIMERS: UpgradeTimer[] = [
  {
    id: 'timer-001',
    accountId: 'acc-003',
    accountName: 'Invaders',
    type: 'Bangunan',
    name: 'Scattershot',
    finishAt: now + 2 * h + 2 * 60 * m + 38 * m + 16 * d,
    status: 'active',
  },
  {
    id: 'timer-002',
    accountId: 'acc-001',
    accountName: 'Bayu Invaders',
    type: 'Bangunan',
    name: 'Inferno Tower',
    finishAt: now + 5 * h + 23 * m,
    status: 'active',
  },
  {
    id: 'timer-003',
    accountId: 'acc-002',
    accountName: 'Par-Ba Invaders',
    type: 'Lab',
    name: 'Dragon',
    finishAt: now + 2 * d + 14 * h,
    status: 'active',
  },
  {
    id: 'timer-004',
    accountId: 'acc-001',
    accountName: 'Bayu Invaders',
    type: 'Lab',
    name: 'Electro Dragon',
    finishAt: now + 6 * d + 8 * h + 30 * m,
    status: 'active',
  },
  {
    id: 'timer-005',
    accountId: 'acc-002',
    accountName: 'Par-Ba Invaders',
    type: 'Bangunan',
    name: 'Archer Tower',
    finishAt: now - 10 * m,
    status: 'done',
  },
  {
    id: 'timer-006',
    accountId: 'acc-003',
    accountName: 'Invaders',
    type: 'Bangunan',
    name: 'Cannon',
    finishAt: now - 2 * h,
    status: 'done',
  },
];

export const DOT_COLORS = [
  '#FFB6C1',
  '#8A2BE2',
  '#00FF7F',
  '#FF4500',
  '#1E90FF',
];