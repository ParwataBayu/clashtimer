import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function sendTelegram(text: string, chatId?: string) {
  const token = TELEGRAM_BOT_TOKEN;
  const cid = chatId || TELEGRAM_CHAT_ID;
  if (!token || !cid) return { ok: false, error: 'Missing telegram token/chat id' };

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cid, text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    return { ok: true, raw: data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function GET(request: Request) {
  try {
    // secret check
    if (CRON_SECRET) {
      const xHeader = request.headers.get('x-cron-secret') || '';
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
      const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      if (xHeader !== CRON_SECRET && bearer !== CRON_SECRET) {
        return NextResponse.json({ ok: false, error: 'Invalid cron secret' }, { status: 401 });
      }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ ok: false, error: 'Supabase service key or url not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id query param' }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // fetch the timer
    const { data: timer, error: fetchErr } = await supabase.from('timers').select('*').eq('id', id).maybeSingle();
    if (fetchErr) return NextResponse.json({ ok: false, error: fetchErr }, { status: 500 });
    if (!timer) return NextResponse.json({ ok: false, error: 'Timer not found' }, { status: 404 });

    // if already notified -> return
    if (timer.notified) return NextResponse.json({ ok: true, skipped: true, reason: 'already_notified', timer });

    // send telegram
    const text = `📢 (TEST) Upgrade Selesai!\n\n✅ ${timer.name} \n👤 Akun : ${timer.accountName}`;
    const sendRes = await sendTelegram(text, timer.chatId || undefined);

    // try update notified
    let updateRes: any = null;
    if (sendRes && (sendRes as any).ok) {
      const { data: notifyData, error: notifyErr } = await supabase
        .from('timers')
        .update({ status: 'done', notified: true })
        .eq('id', id)
        .select()
        .maybeSingle();
      updateRes = { notifyData, notifyErr };
    }

    return NextResponse.json({ ok: true, timer, sendRes, updateRes });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
