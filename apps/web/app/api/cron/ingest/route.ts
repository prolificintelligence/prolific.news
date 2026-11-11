import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { syncTieredFeedsToNeonDb, syncWireFeedsToNeonDb, autoSyndicateHighValueArticles } from '@prolific/jobs';

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
 * Self-healing ingestion trigger. Requires `Authorization: Bearer $CRON_SECRET`
 * (Vercel Cron sends this header automatically when CRON_SECRET is set).
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'tier1';
    const feeds = mode === 'full' ? await syncWireFeedsToNeonDb() : await syncTieredFeedsToNeonDb(1);
    const social = searchParams.get('social') === '0' ? null : await autoSyndicateHighValueArticles(2);
    return NextResponse.json({ ok: true, mode, timestamp: new Date().toISOString(), feeds, social });
  } catch (error) {
    console.error('[Cron Ingest Error]:', error);
    return NextResponse.json({ ok: false, error: 'Ingest failed' }, { status: 500 });
  }
}
