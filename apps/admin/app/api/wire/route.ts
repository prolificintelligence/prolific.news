import { requireAdmin } from '../../../lib/auth/server';
import { NextResponse } from 'next/server';
import { createDb, wireItems, articles, breakingAlerts, desc, eq } from '@prolific/db';
import {
  syncWireFeedsToNeonDb,
  syncTieredFeedsToNeonDb,
  syncCategoryFeedToNeonDb,
  archiveOldContent,
  promoteWireItemToArticle,
  WireArticle,
} from '@prolific/jobs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = createDb();
    const items = await db
      .select()
      .from(wireItems)
      .orderBy(desc(wireItems.pubDate))
      .limit(60);

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error('[API /api/wire] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const { action, wireItem, isLeadHero, tier, category } = body;

    // Action 1: Refresh all feeds
    if (action === 'refresh') {
      const result = await syncWireFeedsToNeonDb();
      return NextResponse.json({ success: true, message: `Synced ${result.inserted} items across all feeds`, total: result.total });
    }

    // Action 2: Refresh specific tier (1, 2, or 3)
    if (action === 'refresh-tier' && tier) {
      const result = await syncTieredFeedsToNeonDb(tier as 1 | 2 | 3);
      return NextResponse.json({ success: true, message: `Synced ${result.inserted} items for Tier ${tier}`, total: result.total, tier });
    }

    // Action 3: Refresh specific category (e.g. Politics, Business)
    if (action === 'refresh-category' && category) {
      const result = await syncCategoryFeedToNeonDb(category);
      return NextResponse.json({ success: true, message: `Synced ${result.inserted} items for ${category}`, total: result.total, category });
    }

    // Action 4b: Auto-publish freshest wire stories for all categories + purge edge cache
    if (action === 'auto-publish-all') {
      const sync = await syncWireFeedsToNeonDb();
      return NextResponse.json({
        success: true,
        message: `Ingested ${sync.inserted} wire items, auto-published ${sync.promoted} fresh articles, edge cache purged.`,
        ...sync,
      });
    }

    // Action 4: Run Archival Lifecycle (Archives old items)
    if (action === 'archive-lifecycle') {
      const result = await archiveOldContent();
      return NextResponse.json({
        success: true,
        message: `Archived ${result.archivedWireCount} wire items and ${result.archivedArticleCount} articles.`,
        ...result,
      });
    }

    // Action 5: Promote wire item to article
    if (action === 'promote' && wireItem) {
      await promoteWireItemToArticle(wireItem as WireArticle, {
        isLeadHero: !!isLeadHero,
        isBreaking: true,
      });

      // Trigger Edge Cache Invalidation on Web Platform
      try {
        const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news';
        const secret = process.env.REVALIDATION_SECRET || '';
        await fetch(`${webUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/', secret }),
        });
      } catch (e) {
        console.warn('[Revalidation] Edge revalidation notice:', e);
      }

      return NextResponse.json({ success: true, message: 'Promoted wire item to published article and revalidated edge cache.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/wire] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
