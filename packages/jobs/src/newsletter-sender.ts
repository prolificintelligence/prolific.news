import { createDb, newsletterSubscribers, articles, eq, desc, and, gte } from '@prolific/db';

export interface NewsletterSendResult {
  ok: boolean;
  subscribersCount: number;
  emailsSent: number;
  failedCount: number;
  error?: string;
}

export async function sendDailyMorningBriefing(): Promise<NewsletterSendResult> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return { ok: false, subscribersCount: 0, emailsSent: 0, failedCount: 0, error: 'RESEND_API_KEY not configured' };
  }

  const db = createDb();

  // 1. Fetch active subscribers
  const subs = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true));

  if (subs.length === 0) {
    return { ok: true, subscribersCount: 0, emailsSent: 0, failedCount: 0 };
  }

  // 2. Fetch top 5 recent high-value stories
  const since = new Date(Date.now() - 48 * 3600 * 1000);
  const stories = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      subtitle: articles.subtitle,
      categoryId: articles.categoryId,
      geoRegion: articles.geoRegion,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.status, 'PUBLISHED'), gte(articles.publishedAt, since)))
    .orderBy(desc(articles.isBreaking), desc(articles.valueScore), desc(articles.publishedAt))
    .limit(5);

  if (stories.length === 0) {
    return { ok: true, subscribersCount: subs.length, emailsSent: 0, failedCount: 0 };
  }

  const webUrl = (process.env.NEXT_PUBLIC_WEB_URL || 'https://prolific.news').replace(/\/$/, '');
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 3. Compose sleek HTML digest
  const storiesHtml = stories
    .map(
      (s, idx) => `
    <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #CC0000; letter-spacing: 1px;">
        ${s.categoryId.replace('cat-', '').toUpperCase()} • ${s.geoRegion || 'GLOBAL'}
      </span>
      <h3 style="margin: 6px 0 8px 0; font-size: 18px; line-height: 1.35; font-family: Georgia, serif;">
        <a href="${webUrl}/article/${s.slug}?utm_source=newsletter&utm_medium=email&utm_campaign=morning_briefing" style="color: #002B49; text-decoration: none;">
          ${s.title}
        </a>
      </h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4B5563;">
        ${s.subtitle || ''}
      </p>
    </div>`
    )
    .join('');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prolific Morning Intelligence Briefing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
    <!-- Header -->
    <div style="background-color: #002B49; padding: 28px 24px; text-align: center; border-bottom: 4px solid #CC0000;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
        PROLIFIC NEWS NETWORK
      </h1>
      <p style="margin: 6px 0 0 0; color: #FFCC00; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
        Morning Intelligence Briefing • ${todayStr}
      </p>
    </div>

    <!-- Sponsor Banner / Underwriter Slot -->
    <div style="background-color: #F8FAFC; padding: 12px 24px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #64748B; text-align: center;">
      <span style="font-weight: 600; color: #0F172A;">Underwritten by Prolific Intelligence:</span> 
      Autonomous news aggregation & global intelligence analytics.
      <a href="${webUrl}/advertise" style="color: #CC0000; text-decoration: underline; margin-left: 6px;">Sponsor This Briefing</a>
    </div>

    <!-- Body -->
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; color: #1F2937; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
        Good morning. Here are the top geopolitical, market, and technology developments curated by the Prolific News Desk over the past 24 hours.
      </p>

      ${storiesHtml}

      <!-- 24/7 Watch CTA -->
      <div style="background-color: #001A2C; color: #FFFFFF; border-radius: 6px; padding: 18px; text-align: center; margin-top: 28px;">
        <h4 style="margin: 0 0 6px 0; font-size: 15px; color: #FFCC00; text-transform: uppercase; letter-spacing: 1px;">
          24/7 Autonomous News Broadcast
        </h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #D1D5DB;">
          Watch live continuous reporting across all regional bureaus.
        </p>
        <a href="${webUrl}/watch" style="display: inline-block; background-color: #CC0000; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 8px 16px; border-radius: 4px; letter-spacing: 1px;">
          Watch Live Stream
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 20px 24px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF;">
      <p style="margin: 0 0 6px 0;">
        You received this email because you subscribed to the Prolific Morning Digest.
      </p>
      <p style="margin: 0;">
        Prolific News Network • <a href="${webUrl}/editorial-policy" style="color: #6B7280; text-decoration: underline;">Editorial Policy</a> • <a href="${webUrl}/privacy" style="color: #6B7280; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const senderEmail = process.env.RESEND_FROM_EMAIL || 'Prolific News <onboarding@resend.dev>';

  let emailsSent = 0;
  let failedCount = 0;

  for (const sub of subs) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [sub.email],
          subject: `Prolific Morning Briefing: ${stories[0].title.slice(0, 70)}`,
          html: emailHtml,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        emailsSent++;
      } else {
        failedCount++;
        const err = await res.json().catch(() => ({}));
        console.warn(`[Newsletter] send failed for ${sub.email}:`, err);
      }
    } catch (sendErr) {
      failedCount++;
      console.warn(`[Newsletter] send error for ${sub.email}:`, sendErr);
    }
  }

  return {
    ok: true,
    subscribersCount: subs.length,
    emailsSent,
    failedCount,
  };
}
