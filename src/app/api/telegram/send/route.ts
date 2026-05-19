import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = body?.text || body?.message || '';
    const chatId = body?.chat_id || process.env.TELEGRAM_CHAT_ID;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Telegram bot token or chat id is not configured on server.' }, { status: 400 });
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing `text` in request body.' }, { status: 400 });
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });

    const data = await res.json();
    if (!data?.ok) {
      return NextResponse.json({ error: data?.description || 'Telegram API error' }, { status: 500 });
    }
    // If caller provided a timerId and a Supabase service key is available,
    // update the timer row to mark as notified (and ensure status done).
    const timerId = body?.timerId;
    let updated: any = null;
    if (timerId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: notifyData, error: notifyErr } = await supabase
          .from('timers')
          .update({ status: 'done', notified: true })
          .eq('id', timerId)
          .select()
          .maybeSingle();

        updated = { notifyData, notifyErr };
      } catch (e) {
        // ignore DB update errors but include them in response
        updated = { error: String(e) };
      }
    }

    return NextResponse.json({ ok: true, result: data.result, updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
