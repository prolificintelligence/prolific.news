import { NextResponse } from 'next/server';
import { getLatestWireBulletins, getActiveBreakingAlert } from '../../../../lib/news-service';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export async function GET() {
  try {
    const [wireItems, breakingAlert] = await Promise.all([
      getLatestWireBulletins(8),
      getActiveBreakingAlert(),
    ]);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        wireItems,
        breakingAlert,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
