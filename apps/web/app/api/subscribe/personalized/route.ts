import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, newsletterSubscribers, eq } from '@prolific/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, topics, regions, frequency } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const selectedTopics = Array.isArray(topics) && topics.length > 0 ? topics : ['Politics', 'Business', 'Tech'];
    const selectedRegions = Array.isArray(regions) && regions.length > 0 ? regions : ['Global'];
    const deliveryFreq = frequency || 'DAILY_MORNING';

    const db = createDb();
    const id = `sub-${crypto.createHash('md5').update(cleanEmail).digest('hex').slice(0, 16)}`;

    await db
      .insert(newsletterSubscribers)
      .values({
        id,
        email: cleanEmail,
        topics: selectedTopics,
        regions: selectedRegions,
        frequency: deliveryFreq,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: {
          topics: selectedTopics,
          regions: selectedRegions,
          frequency: deliveryFreq,
          isActive: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Preferences saved. Prolific Morning Digest will be delivered to your inbox.',
      preferences: {
        email: cleanEmail,
        topics: selectedTopics,
        regions: selectedRegions,
        frequency: deliveryFreq,
      },
    });
  } catch (err: any) {
    console.error('[PersonalizedSubscribe] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save personalization preferences.' },
      { status: 500 }
    );
  }
}
