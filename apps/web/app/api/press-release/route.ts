import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, wireItems } from '@prolific/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      packageId,
      companyName,
      contactEmail,
      headline,
      category = 'Business',
      summary,
      content,
      mediaUrl,
    } = body;

    if (!companyName || !contactEmail || !headline || !summary || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required press release fields.' },
        { status: 400 }
      );
    }

    const db = createDb();
    const id = `wire-pr-${crypto.randomBytes(6).toString('hex')}`;
    const slug = headline
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);

    // Insert into wire items table as a high-value commercial press release
    await db.insert(wireItems).values({
      id,
      slug: `${slug}-${id.slice(-6)}`,
      source: `${companyName} (Sponsored Wire)`,
      title: headline,
      link: `https://prolific.news/submit-press-release?ref=${id}`,
      summary: `${summary} — Contact: ${contactEmail}`,
      category,
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      valueScore: packageId === 'executive' ? 95 : packageId === 'priority' ? 88 : 75,
      geoRegion: 'Global',
      pubDate: new Date(),
      stagedAsDraft: true,
      isArchived: false,
    });

    // Send confirmation email via Resend if configured
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (apiKey) {
      const senderEmail = process.env.RESEND_FROM_EMAIL || 'Prolific News <onboarding@resend.dev>';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [contactEmail],
          subject: `Wire Receipt: ${headline.slice(0, 50)}... [${packageId.toUpperCase()}]`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h2 style="color: #002B49; margin-top: 0;">Prolific News Commercial Wire Filing</h2>
              <p>Thank you for submitting your release to Prolific News Network.</p>
              <div style="background-color: #F8FAFC; padding: 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Submission ID:</strong> ${id}</p>
                <p style="margin: 4px 0;"><strong>Package:</strong> ${packageId.toUpperCase()}</p>
                <p style="margin: 4px 0;"><strong>Headline:</strong> ${headline}</p>
                <p style="margin: 4px 0;"><strong>Company:</strong> ${companyName}</p>
              </div>
              <p>Our editorial desk reviews commercial releases for formatting and compliance before publishing to the network and Google News sitemaps.</p>
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Prolific News Commercial Partnerships Desk • partnerships@prolific.news</p>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(6000),
      }).catch((e) => console.warn('[PressRelease Email Warning]:', e));
    }

    return NextResponse.json({
      success: true,
      submissionId: id,
      packageId,
      message: 'Press release submitted and staged for editorial review.',
    });
  } catch (error: any) {
    console.error('[PressRelease API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Filing failed' },
      { status: 500 }
    );
  }
}
