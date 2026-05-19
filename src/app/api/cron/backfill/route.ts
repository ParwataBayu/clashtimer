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

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cid, text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function GET(request: Request) {
  try {
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const now = Date.now();
    const { data: rows, error } = await supabase
      .from('timers')
      .select('*')
      .lte('finishAt', now)
      .eq('status', 'done')
      .or('notified.is.null,notified.eq.false')
      .limit(500);

    if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

    const results: any[] = [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: true, now, count: 0, results });
    }

    for (const t of rows) {
      try {
        const text = `📢 Upgrade Selesai!\n\n✅ ${t.name} \n👤 Akun : ${t.accountName} \n\nBuka akun coc ${t.accountName} dan upgrade yang lain buruan! 🫵🏻`;
        const sendRes = await sendTelegram(text, t.chatId || undefined);

        if (sendRes && (sendRes as any).ok) {
          const { data: notifyData, error: notifyErr } = await supabase
            .from('timers')
            .update({ notified: true })
            .eq('id', t.id)
            .select()
            .maybeSingle();

          if (notifyErr) {
            results.push({ id: t.id, ok: false, sendRes, error: notifyErr });
          } else {
            results.push({ id: t.id, ok: true, sendRes, notifyData });
          }
        } else {
          results.push({ id: t.id, ok: false, sendRes });
        }
      } catch (e) {
        results.push({ id: t.id, ok: false, error: String(e) });
      }
    }

    return NextResponse.json({ ok: true, now, count: rows.length, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
