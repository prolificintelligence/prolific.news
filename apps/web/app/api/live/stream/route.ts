import { NextResponse } from 'next/server';
import {
  NASA_LIVE_CHANNEL_ID,
  DEFAULT_NASA_LIVE_VIDEO_ID,
  DEFAULT_PUBLIC_DOMAIN_VIDEO_URL,
  buildYouTubeNoCookieEmbedUrl,
} from '../../../../lib/video-catalog';

export const revalidate = 900; // Resolved at runtime with 15-min CDN caching

interface ResolvedStreamPayload {
  mode: 'youtube-live' | 'mp4-fallback';
  videoId: string | null;
  title: string;
  embedUrl: string;
  resolvedAt: string;
}

async function verifyYouTubeEmbeddable(videoId: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'ProlificNewsResolver/1.0' },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title || 'Official NASA Live Stream';
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const channelLiveUrl = `https://www.youtube.com/channel/${NASA_LIVE_CHANNEL_ID}/live`;
    const res = await fetch(channelLiveUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8500),
    });

    if (res.ok) {
      const html = await res.text();
      const liveRendererMatch = html.match(
        /"liveStreamabilityRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/
      );
      const canonicalMatch = html.match(
        /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/
      );
      const activeVideoId = liveRendererMatch?.[1] || canonicalMatch?.[1];
      const isEmbeddable = !html.includes('"playableInEmbed":false');
      const hasLive = Boolean(liveRendererMatch?.[1]) || html.includes('"isLive":true');

      if (activeVideoId && isEmbeddable && hasLive) {
        const verifiedTitle = await verifyYouTubeEmbeddable(activeVideoId);
        if (verifiedTitle) {
          const payload: ResolvedStreamPayload = {
            mode: 'youtube-live',
            videoId: activeVideoId,
            title: verifiedTitle,
            embedUrl: buildYouTubeNoCookieEmbedUrl(activeVideoId),
            resolvedAt: new Date().toISOString(),
          };
          return NextResponse.json(payload, {
            headers: {
              'Cache-Control': 'public, max-age=120, s-maxage=900, stale-while-revalidate=1800',
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('[LiveStreamResolver] NASA live resolution warning:', err);
  }

  // Secondary check: verify known stable NASA ISS live broadcast ID directly
  const fallbackTitle = await verifyYouTubeEmbeddable(DEFAULT_NASA_LIVE_VIDEO_ID);
  if (fallbackTitle) {
    const payload: ResolvedStreamPayload = {
      mode: 'youtube-live',
      videoId: DEFAULT_NASA_LIVE_VIDEO_ID,
      title: fallbackTitle,
      embedUrl: buildYouTubeNoCookieEmbedUrl(DEFAULT_NASA_LIVE_VIDEO_ID),
      resolvedAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=120, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  }

  // Final public-domain native MP4 fallback if NASA YouTube live stream is temporarily down
  const mp4Payload: ResolvedStreamPayload = {
    mode: 'mp4-fallback',
    videoId: null,
    title: 'Earth from Low Orbit: Continental Corridors & Orbital Dynamics',
    embedUrl: DEFAULT_PUBLIC_DOMAIN_VIDEO_URL,
    resolvedAt: new Date().toISOString(),
  };
  return NextResponse.json(mp4Payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}
