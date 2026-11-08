import { NextResponse } from 'next/server';
import {
  syncWireFeedsToNeonDb,
  syncTieredFeedsToNeonDb,
  autoSyndicateHighValueArticles,
} from '@prolific/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'tier1';

    const feedResult =
      mode === 'full'
        ? await syncWireFeedsToNeonDb()
        : await syncTieredFeedsToNeonDb(1);

    const socialResult = await autoSyndicateHighValueArticles(4);

    return NextResponse.json({
      ok: true,
      mode,
      timestamp: new Date().toISOString(),
      feeds: feedResult,
      social: socialResult,
    });
  } catch (error) {
    console.error('[Cron Ingest Error]:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
