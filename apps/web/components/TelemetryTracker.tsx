'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function trackTelemetryEvent(
  eventName: string,
  articleSlug?: string | null,
  metadata: Record<string, any> = {}
) {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  const payload = {
    type: 'event',
    sessionId,
    eventName,
    articleSlug,
    metadata,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/telemetry', blob);
  } else {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  // Forward custom event to Google Tag Manager / GA4 dataLayer
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      article_slug: articleSlug,
      ...metadata,
    });
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let sid = sessionStorage.getItem('pnn_sid');
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      sessionStorage.setItem('pnn_sid', sid);
    }
    return sid;
  } catch {
    return 'fallback_sid';
  }
}

function TelemetryTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageViewIdRef = useRef<string>('');
  const activeSecondsRef = useRef<number>(0);
  const flushedSecondsRef = useRef<number>(-1);
  const maxScrollRef = useRef<number>(0);
  const initialReferrerRef = useRef<string>('');

  useEffect(() => {
    if (typeof document !== 'undefined' && !initialReferrerRef.current) {
      initialReferrerRef.current = document.referrer || '';
    }
  }, []);

  useEffect(() => {
    // Skip automated browsers / bots to avoid unnecessary serverless telemetry writes
    if (
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /bot|crawl|spider|headless|lighthouse|pingdom|preview/i.test(navigator.userAgent))
    ) {
      return;
    }

    const sessionId = getOrCreateSessionId();
    const pageViewId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pv_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    pageViewIdRef.current = pageViewId;
    activeSecondsRef.current = 0;
    flushedSecondsRef.current = -1;
    maxScrollRef.current = 0;

    // Derive article slug if on article page
    let articleSlug: string | undefined;
    if (pathname && pathname.startsWith('/article/')) {
      articleSlug = pathname.replace('/article/', '').split('/')[0];
    }

    const utmSource = searchParams?.get('utm_source') || undefined;
    const utmMedium = searchParams?.get('utm_medium') || undefined;
    const utmCampaign = searchParams?.get('utm_campaign') || undefined;

    const initialPayload = {
      type: 'pageview',
      pageViewId,
      sessionId,
      pathname,
      articleSlug,
      referrer: initialReferrerRef.current,
      utmSource,
      utmMedium,
      utmCampaign,
      dwellTimeSeconds: 0,
      scrollDepthPercent: 0,
    };

    // 1. Initial Page View Beacon
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload),
      keepalive: true,
    }).catch(() => {});

    // Forward page view to Google Tag Manager / GA4 dataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        article_slug: articleSlug,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      });
    }

    // Subsequent internal pages should not carry the external initial referrer
    initialReferrerRef.current = window.location.href;

    // 2. Scroll Depth Monitor
    const handleScroll = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const winHeight = window.innerHeight;
      const scrollPos = window.scrollY + winHeight;
      const pct = Math.min(100, Math.round((scrollPos / (docHeight || 1)) * 100));
      if (pct > maxScrollRef.current) {
        maxScrollRef.current = pct;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Local Active Dwell Time Counter (no periodic network polling)
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    // 4. Flush once on tab leave / unload (only if meaningful engagement occurred)
    const flushOnce = () => {
      const secs = activeSecondsRef.current;
      if (secs < 2 && maxScrollRef.current < 10) return;
      if (flushedSecondsRef.current === secs) return;
      flushedSecondsRef.current = secs;
      sendHeartbeat(pageViewId, sessionId, pathname, articleSlug);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushOnce();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushOnce);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushOnce);
      flushOnce();
    };
  }, [pathname, searchParams]);

  function sendHeartbeat(
    pageViewId: string,
    sessionId: string,
    path: string,
    articleSlug?: string
  ) {
    if (!pageViewId) return;
    const payload = {
      type: 'heartbeat',
      pageViewId,
      sessionId,
      pathname: path,
      articleSlug,
      dwellTimeSeconds: activeSecondsRef.current,
      scrollDepthPercent: maxScrollRef.current,
    };

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', blob);
    } else {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  return null;
}

export function TelemetryTracker() {
  return (
    <Suspense fallback={null}>
      <TelemetryTrackerInner />
    </Suspense>
  );
}
