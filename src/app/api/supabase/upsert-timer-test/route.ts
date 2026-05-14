import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not configured' }, { status: 400 });
    }

    const supabase = createClient(url, key);

    const sample = {
      id: `debug-timer-${Date.now()}`,
      accountId: 'debug-account-1',
      accountName: 'Debug Account',
      type: 'Bangunan',
      name: 'Debug Tower',
      finishAt: Date.now() + 1000 * 60 * 60,
      screenshotUrl: null,
      status: 'active',
    };

    const { data, error } = await supabase.from('timers').upsert([sample]);

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
