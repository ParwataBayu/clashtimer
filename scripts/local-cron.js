const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const CRON_SECRET = process.env.CRON_SECRET || '';
const INTERVAL_MS = Number(process.env.LOCAL_CRON_INTERVAL_MS) || 10000; // default 10s

if (!CRON_SECRET) {
  console.error('CRON_SECRET not set in env. Export CRON_SECRET before running.');
  process.exit(1);
}

const url = `http://localhost:4028/api/cron/backfill`;

async function runOnce() {
  try {
    const res = await fetch(url, { headers: { 'x-cron-secret': CRON_SECRET } });
    const body = await res.text();
    console.log(new Date().toISOString(), 'backfill status', res.status, body.substring(0, 200));
  } catch (e) {
    console.error(new Date().toISOString(), 'backfill error', e.message || e);
  }
}

console.log('Starting local cron, polling', url, 'every', INTERVAL_MS, 'ms');
runOnce();
setInterval(runOnce, INTERVAL_MS);
