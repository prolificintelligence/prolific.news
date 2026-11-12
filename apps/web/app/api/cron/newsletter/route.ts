import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { inngest, sendDailyMorningBriefing } from '@prolific/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Scheduled Morning Intelligence Briefing Dispatcher.
 * Dispatches to Inngest when `INNGEST_EVENT_KEY` is configured (`?inline=1` forces synchronous execution).
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    if (process.env.INNGEST_EVENT_KEY && searchParams.get('inline') !== '1') {
      const dispatched = await inngest.send({
        name: 'newsletter/morning.requested',
        data: { triggeredAt: new Date().toISOString() },
      });
      return NextResponse.json({
        ok: true,
        queued: 'inngest',
        event: 'newsletter/morning.requested',
        ids: dispatched.ids,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await sendDailyMorningBriefing();
    return NextResponse.json({
      queued: 'inline',
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('[Cron Newsletter Error]:', error);
    return NextResponse.json({ ok: false, error: 'Newsletter dispatch failed' }, { status: 500 });
  }
}
