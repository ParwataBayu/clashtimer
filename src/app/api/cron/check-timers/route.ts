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
    return data;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function GET(request: Request) {
  try {
    // optional secret header to protect endpoint
    if (CRON_SECRET) {
      const xHeader = request.headers.get('x-cron-secret') || '';
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';

      // Accept either x-cron-secret: <secret> OR Authorization: Bearer <secret>
      const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      if (xHeader !== CRON_SECRET && bearer !== CRON_SECRET) {
        return NextResponse.json({ ok: false, error: 'Invalid cron secret' }, { status: 401 });
      }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ ok: false, error: 'Supabase service key or url not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // find timers that are not done and finishAt <= now
    const now = Date.now();
    // select timers where finishAt passed AND (not yet notified OR not done)
    // This ensures timers that were marked `done` by the client but left `notified=null`
    // will still be processed by cron.
    const { data: dueTimers, error } = await supabase
      .from('timers')
      .select('*')
      .lte('finishAt', now)
      .or('notified.is.null,notified.eq.false,status.neq.done')
      .limit(200);

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    const results: Array<any> = [];

    if (Array.isArray(dueTimers) && dueTimers.length > 0) {
      for (const t of dueTimers) {
        try {
          // always mark status done and return updated row
          const { data: upData, error: upErr } = await supabase
            .from('timers')
            .update({ status: 'done' })
            .eq('id', t.id)
            .select();

          if (upErr) {
            console.error('Cron: failed to mark done', { id: t.id, error: upErr });
            results.push({ id: t.id, ok: false, error: upErr });
            continue;
          }

          // only send telegram if not yet notified (null or false)
          if (t.notified) {
            results.push({ id: t.id, ok: true, skipped: true, reason: 'already_notified' });
            continue;
          }

          const text = `📢 Upgrade Selesai!\n\n✅ ${t.name} \n👤 Akun : ${t.accountName} \n\nBuka akun coc ${t.accountName} dan upgrade yang lain buruan! 🫵🏻`;
          const sendRes = await sendTelegram(text, t.chatId || undefined);

          if (sendRes && (sendRes as any).ok) {
            // mark notified true (and ensure status remains done) in one update
            const { data: notifyData, error: notifyErr } = await supabase
              .from('timers')
              .update({ status: 'done', notified: true })
              .eq('id', t.id)
              .select()
              .maybeSingle();

            if (notifyErr) {
              console.error('Cron: failed to mark notified', { id: t.id, error: notifyErr });
              results.push({ id: t.id, ok: false, sendRes, error: notifyErr });
            } else {
              console.info('Cron: notified updated', { id: t.id, notifyData });
              results.push({ id: t.id, ok: true, sendRes, notifyData });
            }
          } else {
            // keep notified=null so cron can retry later
            console.warn('Cron: telegram send failed', { id: t.id, sendRes });
            results.push({ id: t.id, ok: false, sendRes });
          }
        } catch (e) {
          console.error('Cron: unexpected error for timer', { id: t.id, error: e });
          results.push({ id: t.id, ok: false, error: String(e) });
        }
      }
    }

    return NextResponse.json({ ok: true, now, count: dueTimers?.length ?? 0, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
