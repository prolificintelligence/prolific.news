import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { path, tag, secret } = await req.json().catch(() => ({}));
    const authSecret = process.env.REVALIDATION_SECRET;

    if (!authSecret || secret !== authSecret) {
      return NextResponse.json({ error: 'Invalid revalidation secret' }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
    }

    if (tag) {
      revalidateTag(tag);
    }

    // Always revalidate root if no path specified
    if (!path && !tag) {
      revalidatePath('/');
    }

    return NextResponse.json({
      revalidated: true,
      path: path || '/',
      tag: tag || null,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
  }
}
