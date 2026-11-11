import { NextResponse } from 'next/server';
import { createDb, contactInquiries, eq, desc, and } from '@prolific/db';
import { requireAdmin } from '../../../lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    const db = createDb();
    const rows = await db
      .select()
      .from(contactInquiries)
      .orderBy(desc(contactInquiries.createdAt))
      .limit(100);

    let filtered = rows;
    if (department && department !== 'ALL') {
      filtered = filtered.filter((r) => r.department === department);
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }

    return NextResponse.json({
      ok: true,
      inquiries: filtered,
      counts: {
        total: rows.length,
        new: rows.filter((r) => r.status === 'NEW').length,
        editorial: rows.filter((r) => r.department === 'editorial').length,
        partnerships: rows.filter((r) => r.department === 'partnerships').length,
        wire: rows.filter((r) => r.department === 'wire').length,
        support: rows.filter((r) => r.department === 'support').length,
        legal: rows.filter((r) => r.department === 'legal').length,
      },
    });
  } catch (error: any) {
    console.error('[Admin Inquiries GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ ok: false, error: 'id and status required' }, { status: 400 });
    }

    const db = createDb();
    await db.update(contactInquiries).set({ status }).where(eq(contactInquiries.id, id));

    return NextResponse.json({ ok: true, id, status });
  } catch (error: any) {
    console.error('[Admin Inquiries PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
