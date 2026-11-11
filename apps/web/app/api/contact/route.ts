import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createDb, contactInquiries } from '@prolific/db';
import { DEPARTMENTS } from '../../../lib/site';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { department = 'editorial', name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const deptConfig = DEPARTMENTS[department] || DEPARTMENTS.editorial;
    const db = createDb();
    const id = `inq-${crypto.randomBytes(6).toString('hex')}`;

    // Hash client IP if available
    const forwarded = req.headers.get('x-forwarded-for') || '';
    const ip = forwarded.split(',')[0].trim() || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    // 1. Dual Delivery: Insert into database
    await db.insert(contactInquiries).values({
      id,
      department: deptConfig.id,
      name: name.trim().slice(0, 255),
      email: email.trim().toLowerCase().slice(0, 255),
      subject: subject.trim().slice(0, 500),
      message: message.trim(),
      status: 'NEW',
      ipHash,
    });

    // 2. Dual Delivery: Resend notification email
    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Prolific News Network <onboarding@resend.dev>';

      // Internal notification to department inbox (forwards via Cloudflare to central admin)
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [deptConfig.email],
          reply_to: email,
          subject: `[${deptConfig.name}] ${subject}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h2 style="color: #002B49; margin-top: 0;">New Inquiry: ${deptConfig.name}</h2>
              <div style="background-color: #F8FAFC; padding: 14px 18px; border-radius: 6px; margin: 16px 0; font-size: 14px;">
                <p style="margin: 4px 0;"><strong>Inquiry ID:</strong> ${id}</p>
                <p style="margin: 4px 0;"><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 4px 0;"><strong>Department:</strong> ${deptConfig.name} (${deptConfig.email})</p>
              </div>
              <div style="white-space: pre-wrap; font-size: 15px; color: #1F2937; line-height: 1.6; border-left: 3px solid #CC0000; padding-left: 12px; margin: 16px 0;">
${message}
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Received via prolific.news/contact • Reply directly to this message to respond to ${name}.</p>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(6000),
      }).catch((e) => console.warn('[Contact Route Internal Send Warning]:', e));

      // Automated confirmation receipt to reader
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Inquiry Received: ${subject} [Ref: ${id}]`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <div style="background-color: #002B49; color: white; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">PROLIFIC NEWS NETWORK</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #FFCC00;">Desk Inquiry Receipt</p>
              </div>
              <p>Hello ${name},</p>
              <p>Thank you for contacting the <strong>${deptConfig.name}</strong>. Your message has been logged with reference number <code>${id}</code>.</p>
              <p>Our standard response window for this department is <strong>${deptConfig.sla}</strong>.</p>
              <div style="background-color: #F8FAFC; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #4B5563; margin: 16px 0;">
                <p style="margin: 0 0 6px 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 0;"><strong>Routed to:</strong> ${deptConfig.email}</p>
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Prolific News Network Communications • <a href="https://prolific.news" style="color: #002B49;">prolific.news</a></p>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(6000),
      }).catch((e) => console.warn('[Contact Route User Receipt Warning]:', e));
    }

    return NextResponse.json({
      success: true,
      inquiryId: id,
      department: deptConfig.name,
      message: `Your inquiry has been received by the ${deptConfig.name}. We will review and respond within our standard window (${deptConfig.sla}).`,
    });
  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Submission failed.' },
      { status: 500 }
    );
  }
}
