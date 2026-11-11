import { createNeonAuth } from '@neondatabase/auth/next/server';
import { NextResponse } from 'next/server';

/**
 * Neon Auth (managed Better Auth) server instance for the Prolific Newsroom admin.
 * Requires NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (>= 32 chars).
 */
const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  'placeholder-secret-for-build-time-only-minimum-32-chars';
const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  'https://auth.prolific.news';

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});

/** Only these emails may access the admin, even if another Neon Auth account exists. */
export function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(user?: { email?: string | null; emailVerified?: boolean | null } | null): boolean {
  if (!user?.email) return false;
  if (user.emailVerified === false) return false;
  return getAllowedAdminEmails().includes(user.email.toLowerCase());
}

export type AdminSessionResult =
  | { ok: true; user: { id: string; email: string; name?: string | null } }
  | { ok: false; status: 401 | 403 };

/** Resolve the current session and enforce the allowlist. Fails closed on any error. */
export async function getAdminSession(): Promise<AdminSessionResult> {
  try {
    const { data } = await auth.getSession();
    const user = data?.user as any;
    if (!user) return { ok: false, status: 401 };
    if (!isAllowedAdmin(user)) return { ok: false, status: 403 };
    return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (err) {
    console.error('[AdminAuth] session check failed:', err);
    return { ok: false, status: 401 };
  }
}

/**
 * Route-handler guard (defense in depth behind middleware).
 * Usage: const denied = await requireAdmin(); if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (session.ok) return null;
  return NextResponse.json(
    { success: false, error: session.status === 401 ? 'Authentication required' : 'Forbidden' },
    { status: session.status }
  );
}
