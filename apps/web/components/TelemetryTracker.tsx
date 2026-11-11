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
  const maxScrollRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const initialReferrerRef = useRef<string>('');

  useEffect(() => {
    if (typeof document !== 'undefined' && !initialReferrerRef.current) {
      initialReferrerRef.current = document.referrer || '';
    }
  }, []);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const pageViewId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pv_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    pageViewIdRef.current = pageViewId;
    activeSecondsRef.current = 0;
    maxScrollRef.current = 0;
    lastActiveTimestampRef.current = Date.now();

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

    // 3. Active Dwell Time Counter
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        activeSecondsRef.current += 1;

        // Periodic Heartbeat every 15 seconds
        if (activeSecondsRef.current % 15 === 0) {
          sendHeartbeat(pageViewId, sessionId, pathname, articleSlug);
        }
      }
    }, 1000);

    // 4. Flush on tab leave / unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendHeartbeat(pageViewId, sessionId, pathname, articleSlug);
      }
    };
    const handleBeforeUnload = () => {
      sendHeartbeat(pageViewId, sessionId, pathname, articleSlug);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendHeartbeat(pageViewId, sessionId, pathname, articleSlug);
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
