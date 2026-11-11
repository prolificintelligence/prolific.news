/**
 * Real social channel adapters. Each adapter either performs a genuine API call
 * and returns the platform's own post identifier, or reports a failure.
 * Nothing here ever fabricates a success.
 */
import type { SocialPlatform } from '@prolific/types';

export interface DispatchInput {
  /** Stable id, used as an idempotency key where the platform supports it. */
  idempotencyKey: string;
  headline: string;
  description: string;
  /** Fully formed article URL (with UTM params). */
  url: string;
  /** Pre-crafted platform copy (used by Telegram / Mastodon). */
  text: string;
  imageUrl?: string | null;
}

export type DispatchResult =
  | { ok: true; externalId: string; externalUrl?: string }
  | { ok: false; error: string };

const TIMEOUT_MS = 15000;

function env(name: string): string {
  return (process.env[name] || '').trim();
}

/** Platforms that currently have credentials configured. */
export function configuredPlatforms(): SocialPlatform[] {
  const out: SocialPlatform[] = [];
  if (env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHANNEL_ID')) out.push('TELEGRAM');
  if (env('BLUESKY_HANDLE') && env('BLUESKY_APP_PASSWORD')) out.push('BLUESKY');
  if (env('MASTODON_INSTANCE_URL') && env('MASTODON_ACCESS_TOKEN')) out.push('MASTODON');
  if (env('DISCORD_WEBHOOK_URL')) out.push('DISCORD');
  return out;
}

function truncate(s: string, max: number): string {
  const chars = Array.from(s);
  return chars.length <= max ? s : chars.slice(0, max - 1).join('').trimEnd() + '…';
}

/* ----------------------------- Telegram ----------------------------- */

async function postTelegram(input: DispatchInput): Promise<DispatchResult> {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHANNEL_ID');
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncate(input.text, 4000),
        link_preview_options: { url: input.url, prefer_large_media: true },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: `Telegram ${res.status}: ${data.description || 'send failed'}` };
    }
    const msgId = String(data.result?.message_id);
    const username = data.result?.chat?.username;
    return {
      ok: true,
      externalId: msgId,
      externalUrl: username ? `https://t.me/${username}/${msgId}` : undefined,
    };
  } catch (err: any) {
    return { ok: false, error: `Telegram: ${err?.message || err}` };
  }
}

/* ----------------------------- Bluesky ------------------------------ */

async function postBluesky(input: DispatchInput): Promise<DispatchResult> {
  const pds = (env('BLUESKY_PDS_URL') || 'https://bsky.social').replace(/\/$/, '');
  try {
    const sessionRes = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: env('BLUESKY_HANDLE'),
        password: env('BLUESKY_APP_PASSWORD'),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const session: any = await sessionRes.json().catch(() => ({}));
    if (!sessionRes.ok || !session.accessJwt) {
      return { ok: false, error: `Bluesky login ${sessionRes.status}: ${session.message || session.error || 'failed'}` };
    }
    const auth = { Authorization: `Bearer ${session.accessJwt}` };

    // Optional link-card thumbnail (best effort; the post still succeeds without it).
    let thumb: unknown;
    if (input.imageUrl) {
      try {
        const imgRes = await fetch(input.imageUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (imgRes.ok) {
          const bytes = await imgRes.arrayBuffer();
          const mime = imgRes.headers.get('content-type') || 'image/jpeg';
          if (bytes.byteLength < 950_000) {
            const up = await fetch(`${pds}/xrpc/com.atproto.repo.uploadBlob`, {
              method: 'POST',
              headers: { ...auth, 'Content-Type': mime },
              body: bytes,
              signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            const upData: any = await up.json().catch(() => ({}));
            if (up.ok && upData.blob) thumb = upData.blob;
          }
        }
      } catch {
        /* thumbnail is optional */
      }
    }

    const record: any = {
      $type: 'app.bsky.feed.post',
      text: truncate(input.headline, 280),
      createdAt: new Date().toISOString(),
      langs: ['en'],
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: input.url,
          title: truncate(input.headline, 300),
          description: truncate(input.description || input.headline, 300),
          ...(thumb ? { thumb } : {}),
        },
      },
    };

    const createRes = await fetch(`${pds}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const created: any = await createRes.json().catch(() => ({}));
    if (!createRes.ok || !created.uri) {
      return { ok: false, error: `Bluesky post ${createRes.status}: ${created.message || created.error || 'failed'}` };
    }
    const rkey = String(created.uri).split('/').pop();
    return {
      ok: true,
      externalId: created.uri,
      externalUrl: `https://bsky.app/profile/${session.handle}/post/${rkey}`,
    };
  } catch (err: any) {
    return { ok: false, error: `Bluesky: ${err?.message || err}` };
  }
}

/* ----------------------------- Mastodon ----------------------------- */

async function postMastodon(input: DispatchInput): Promise<DispatchResult> {
  const base = env('MASTODON_INSTANCE_URL').replace(/\/$/, '');
  try {
    // Mastodon counts every URL as 23 chars, so keep the headline well under 500 total.
    const status = `${truncate(input.headline, 380)}\n\n${input.url}`;
    const res = await fetch(`${base}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('MASTODON_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({ status, visibility: 'public', language: 'en' }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.id) {
      return { ok: false, error: `Mastodon ${res.status}: ${data.error || 'post failed'}` };
    }
    return { ok: true, externalId: String(data.id), externalUrl: data.url };
  } catch (err: any) {
    return { ok: false, error: `Mastodon: ${err?.message || err}` };
  }
}

/* ----------------------------- Discord ------------------------------ */

async function postDiscord(input: DispatchInput): Promise<DispatchResult> {
  const webhookUrl = env('DISCORD_WEBHOOK_URL');
  try {
    const embed: any = {
      title: truncate(input.headline, 256),
      description: truncate(input.description || input.headline, 1000),
      url: input.url,
      color: 0x002b49,
      footer: { text: 'Prolific News Network • Verified Global Wire' },
      timestamp: new Date().toISOString(),
    };
    if (input.imageUrl) {
      embed.image = { url: input.imageUrl };
    }

    const res = await fetch(`${webhookUrl}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Prolific News Network',
        avatar_url: 'https://prolific.news/logo.png',
        embeds: [embed],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.id) {
      return { ok: false, error: `Discord ${res.status}: ${data.message || 'webhook send failed'}` };
    }
    return {
      ok: true,
      externalId: String(data.id),
      externalUrl: `https://discord.com/channels/@me/${data.channel_id}/${data.id}`,
    };
  } catch (err: any) {
    return { ok: false, error: `Discord: ${err?.message || err}` };
  }
}

/* ------------------------------ Router ------------------------------ */

export async function dispatchToPlatform(
  platform: SocialPlatform,
  input: DispatchInput
): Promise<DispatchResult> {
  if (!configuredPlatforms().includes(platform)) {
    return { ok: false, error: `${platform} is not configured` };
  }
  switch (platform) {
    case 'TELEGRAM':
      return postTelegram(input);
    case 'BLUESKY':
      return postBluesky(input);
    case 'MASTODON':
      return postMastodon(input);
    case 'DISCORD':
      return postDiscord(input);
    default:
      return { ok: false, error: `${platform} has no adapter` };
  }
}
