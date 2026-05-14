import { NextResponse } from 'next/server';
import { GET as checkTimers } from './check-timers/route';

export async function GET(request: Request) {
  // Proxy to the detailed check-timers handler so Vercel cron can target /api/cron
  return checkTimers(request as any);
}
