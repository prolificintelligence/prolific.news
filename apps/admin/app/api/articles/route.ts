import { requireAdmin } from '../../../lib/auth/server';
import { NextResponse } from 'next/server';
import { createDb, articles, authors, desc, eq } from '@prolific/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = createDb();
    const rows = await db
      .select({
        article: articles,
        author: authors,
      })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .orderBy(desc(articles.publishedAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      articles: rows.map((r) => ({
        ...r.article,
        author: r.author || { name: 'Editorial Staff', role: 'Newsroom Desk' },
      })),
    });
  } catch (err: any) {
    console.error('[API /api/articles] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const db = createDb();

    const id = body.id || `art-${Date.now()}`;
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 60);

    await db.insert(articles).values({
      id,
      slug,
      title: body.title.toUpperCase(),
      subtitle: body.subtitle || '',
      keyDevelopments: body.keyDevelopments || [],
      content: body.content || '',
      categoryId: body.categoryId || 'cat-general',
      tags: body.tags || ['News'],
      authorId: body.authorId || 'auth-sterling',
      leadMediaType: body.leadMediaType || 'IMAGE',
      leadMediaUrl: body.leadMediaUrl || '',
      leadMediaCaption: body.leadMediaCaption || '',
      isLeadHero: !!body.isLeadHero,
      isBreaking: !!body.isBreaking,
      status: body.status || 'PUBLISHED',
      readTimeMinutes: body.readTimeMinutes || 3,
      publishedAt: new Date(),
    });

    return NextResponse.json({ success: true, id, slug });
  } catch (err: any) {
    console.error('[API /api/articles] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing article ID' }, { status: 400 });
    }

    const db = createDb();
    await db.delete(articles).where(eq(articles.id, id));

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (err: any) {
    console.error('[API /api/articles] DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
