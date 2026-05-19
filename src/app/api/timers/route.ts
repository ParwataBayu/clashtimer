import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Supabase service key not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 });

    const timers = Array.isArray(body) ? body : [body];
    if (!timers.length) return NextResponse.json({ ok: true, count: 0 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.from('timers').upsert(timers).select();
    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
