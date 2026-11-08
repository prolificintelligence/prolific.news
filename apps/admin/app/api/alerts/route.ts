import { requireAdmin } from '../../../lib/auth/server';
import { NextResponse } from 'next/server';
import { createDb, breakingAlerts, desc, eq } from '@prolific/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = createDb();
    const [alert] = await db
      .select()
      .from(breakingAlerts)
      .orderBy(desc(breakingAlerts.publishedAt))
      .limit(1);

    return NextResponse.json({ success: true, alert: alert || null });
  } catch (err: any) {
    console.error('[API /api/alerts] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const db = createDb();

    // Deactivate previous alerts if new one is active
    if (body.active) {
      await db.update(breakingAlerts).set({ active: false });
    }

    const id = body.id || `alert-${Date.now()}`;
    await db.insert(breakingAlerts).values({
      id,
      headline: body.headline.toUpperCase(),
      url: body.url || '/',
      urgency: body.urgency || 'BREAKING',
      active: body.active ?? true,
      publishedAt: new Date(),
    });

    // Trigger Edge Cache Invalidation on Web Platform
    try {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news';
      const secret = process.env.REVALIDATION_SECRET || 'prolific-edge-revalidate-secret-token';
      await fetch(`${webUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/', secret }),
      });
    } catch (e) {
      console.warn('[Revalidation] Edge revalidation notice:', e);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[API /api/alerts] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
