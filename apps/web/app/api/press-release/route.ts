import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, wireItems, contactInquiries } from '@prolific/db';

export const dynamic = 'force-dynamic';

const SPAM_REGEX =
  /\b(casino|betting|gambling|slots|roulette|poker|viagra|cialis|crypto\s*presale|token\s*presale|pump\s*and\s*dump|payday\s*loan|forex\s*signal|escort\s*service|adult\s*dating|weight\s*loss\s*pill)\b/i;

const TIER_PRICING: Record<string, { name: string; price: string; valueScore: number }> = {
  standard: { name: 'Standard Wire Publication', price: '$79', valueScore: 82 },
  priority: { name: 'Priority Executive Spotlight', price: '$149', valueScore: 92 },
  agency: { name: 'Agency 5-Release Retainer Pack', price: '$399', valueScore: 95 },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      packageId = 'priority',
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

    // 1. Prohibited spam niches & policy gate
    const combinedText = `${headline} ${summary} ${content}`;
    if (SPAM_REGEX.test(combinedText)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Content does not meet PNN editorial standards. Promotional gambling, unregulated cryptocurrency presales, adult services, and pharmaceutical submissions are strictly prohibited.',
        },
        { status: 422 }
      );
    }

    // 2. Minimum word count verification for Google News standards
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 200) {
      return NextResponse.json(
        {
          success: false,
          error: `Press release body must be at least 200 words to meet Google News indexing standards (current: ${wordCount} words).`,
        },
        { status: 400 }
      );
    }

    const tier = TIER_PRICING[packageId] || TIER_PRICING.standard;
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
      mediaUrl:
        mediaUrl ||
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      valueScore: tier.valueScore,
      geoRegion: 'Global',
      pubDate: new Date(),
      stagedAsDraft: true,
      isArchived: false,
    });

    // Log commercial filing into Contact Inquiries cockpit for editorial tracking
    const inqId = `inq-pr-${crypto.randomBytes(5).toString('hex')}`;
    await db
      .insert(contactInquiries)
      .values({
        id: inqId,
        department: 'wire',
        name: companyName.trim().slice(0, 255),
        email: contactEmail.trim().toLowerCase().slice(0, 255),
        subject: `[WIRE ${tier.name.toUpperCase()} - ${tier.price}] ${headline}`.slice(0, 500),
        message: `Wire ID: ${id}\nPackage: ${tier.name} (${tier.price})\nCategory: ${category}\nWord Count: ${wordCount}\nSummary: ${summary}\n\n${content}`,
        status: 'NEW',
        ipHash: 'wire-portal',
      })
      .catch((e) => console.warn('[PressRelease Inquiry Log Warning]:', e));

    // Dynamic Stripe Payment Link resolution if configured via env
    const paymentUrl =
      packageId === 'agency'
        ? process.env.STRIPE_AGENCY_PAYMENT_URL || null
        : packageId === 'priority'
        ? process.env.STRIPE_PRIORITY_PAYMENT_URL || null
        : process.env.STRIPE_STANDARD_PAYMENT_URL || null;

    // Send confirmation email & internal wire desk alert via Resend if configured
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (apiKey) {
      const senderEmail = process.env.RESEND_FROM_EMAIL || 'Prolific News <onboarding@resend.dev>';

      // Internal Wire Desk Notification (routes to wire@prolific.news)
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: ['wire@prolific.news'],
          reply_to: contactEmail,
          subject: `[COMMERCIAL WIRE FILING - ${tier.name.toUpperCase()} ${tier.price}] ${headline.slice(0, 60)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h2 style="color: #002B49; margin-top: 0;">New Commercial Press Release Filing</h2>
              <div style="background-color: #FEF2F2; border-left: 4px solid #CC0000; padding: 14px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Wire ID:</strong> ${id}</p>
                <p style="margin: 4px 0;"><strong>Package Tier:</strong> ${tier.name} (${tier.price})</p>
                <p style="margin: 4px 0;"><strong>Organization:</strong> ${companyName}</p>
                <p style="margin: 4px 0;"><strong>Contact Email:</strong> ${contactEmail}</p>
                <p style="margin: 4px 0;"><strong>Word Count:</strong> ${wordCount} words</p>
              </div>
              <p><strong>Headline:</strong> ${headline}</p>
              <p><strong>Summary:</strong> ${summary}</p>
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Logged in Admin Inquiries (${inqId}) and staged in wire_items.</p>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(6000),
      }).catch((e) => console.warn('[PressRelease Internal Email Warning]:', e));

      // Customer Confirmation Receipt
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [contactEmail],
          subject: `Wire Filing Confirmation: ${headline.slice(0, 50)}... [${tier.price}]`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h2 style="color: #002B49; margin-top: 0;">Prolific News Commercial Wire Filing</h2>
              <p>Thank you for submitting your release to Prolific News Network.</p>
              <div style="background-color: #F8FAFC; padding: 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Submission ID:</strong> ${id}</p>
                <p style="margin: 4px 0;"><strong>Package:</strong> ${tier.name} (${tier.price})</p>
                <p style="margin: 4px 0;"><strong>Headline:</strong> ${headline}</p>
                <p style="margin: 4px 0;"><strong>Company:</strong> ${companyName}</p>
              </div>
              <p>Our editorial desk reviews commercial releases for formatting and compliance with Google Search Central guidelines before publishing to the network and Google News sitemaps.</p>
              ${
                paymentUrl
                  ? `<div style="margin: 20px 0;"><a href="${paymentUrl}" style="background-color: #FFCC00; color: #002B49; font-weight: bold; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Payment (${tier.price})</a></div>`
                  : `<p style="font-size: 13px; color: #374151;">An invoice link with payment settlement details has been flagged for this filing.</p>`
              }
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Prolific News Commercial Wire Desk • wire@prolific.news</p>
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
      tierName: tier.name,
      price: tier.price,
      paymentUrl,
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
