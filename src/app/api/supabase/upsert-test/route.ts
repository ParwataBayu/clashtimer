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
      id: `debug-test-${Date.now()}`,
      name: 'Debug Test Account',
      thLevel: 1,
      dotColor: '#000000',
    };

    const { data, error } = await supabase.from('accounts').upsert([sample]);

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
