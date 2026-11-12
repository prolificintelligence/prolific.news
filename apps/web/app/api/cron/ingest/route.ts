import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  inngest,
  syncTieredFeedsToNeonDb,
  syncWireFeedsToNeonDb,
  autoSyndicateHighValueArticles,
} from '@prolific/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when not configured
  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Self-healing ingestion trigger. Requires `Authorization: Bearer $CRON_SECRET`.
 * Dispatches into Inngest's step-chunked, concurrency-limited queue when `INNGEST_EVENT_KEY`
 * is set (pass `?inline=1` to run synchronously for debugging).
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'tier1';
    const sendSocial = searchParams.get('social') !== '0';

    if (process.env.INNGEST_EVENT_KEY && searchParams.get('inline') !== '1') {
      const eventName = mode === 'full' ? 'wire/full.requested' : 'wire/tier1.requested';
      const dispatched = await inngest.send({
        name: eventName,
        data: { mode, social: sendSocial, triggeredAt: new Date().toISOString() },
      });
      return NextResponse.json({
        ok: true,
        queued: 'inngest',
        event: eventName,
        ids: dispatched.ids,
        mode,
        social: sendSocial,
        timestamp: new Date().toISOString(),
      });
    }

    const feeds = mode === 'full' ? await syncWireFeedsToNeonDb() : await syncTieredFeedsToNeonDb(1);
    const social = sendSocial ? await autoSyndicateHighValueArticles(2) : null;
    return NextResponse.json({ ok: true, queued: 'inline', mode, timestamp: new Date().toISOString(), feeds, social });
  } catch (error) {
    console.error('[Cron Ingest Error]:', error);
    return NextResponse.json({ ok: false, error: 'Ingest failed' }, { status: 500 });
  }
}
