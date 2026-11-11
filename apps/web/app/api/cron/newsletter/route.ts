import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendDailyMorningBriefing } from '@prolific/jobs';

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
 * Triggered daily (e.g. 07:00 UTC) via Vercel Cron or GitHub Actions.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendDailyMorningBriefing();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('[Cron Newsletter Error]:', error);
    return NextResponse.json({ ok: false, error: 'Newsletter dispatch failed' }, { status: 500 });
  }
}
