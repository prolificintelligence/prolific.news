'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function isAutomatedClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean(
    navigator.webdriver ||
      /bot|crawl|spider|headless|lighthouse|pingdom|preview|slurp/i.test(navigator.userAgent)
  );
}

export function trackTelemetryEvent(
  eventName: string,
  articleSlug?: string | null,
  metadata: Record<string, any> = {}
) {
  if (typeof window === 'undefined' || isAutomatedClient()) return;

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
      sid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      sessionStorage.setItem('pnn_sid', sid);
    }
    return sid;
  } catch {
    return 'fallback_sid';
  }
}

function getSessionStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

function TelemetryTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageViewIdRef = useRef<string>('');
  const activeSecondsRef = useRef<number>(0);
  const lastFlushedKeyRef = useRef<string>('');
  const maxScrollRef = useRef<number>(0);
  const initialReferrerRef = useRef<string>('');
  const lastTrackedSearchRef = useRef<string>('');

  useEffect(() => {
    if (typeof document !== 'undefined' && !initialReferrerRef.current) {
      initialReferrerRef.current = document.referrer || '';
    }
  }, []);

  // Track explicit searches without minting duplicate /search pageviews on query changes
  useEffect(() => {
    if (isAutomatedClient() || pathname !== '/search') return;
    const q = (searchParams?.get('q') || '').trim();
    const cat = (searchParams?.get('category') || 'All').trim();
    const key = `${q}|${cat}`;
    if (!q || lastTrackedSearchRef.current === key) return;
    lastTrackedSearchRef.current = key;
    trackTelemetryEvent('search_query', null, { queryLength: q.length, category: cat });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isAutomatedClient()) return;

    const sessionId = getOrCreateSessionId();
    const pageViewId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `pv_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    pageViewIdRef.current = pageViewId;
    activeSecondsRef.current = 0;
    lastFlushedKeyRef.current = '';
    maxScrollRef.current = 0;

    // Derive article slug and category from route & committed DOM attributes
    let articleSlug: string | undefined;
    let articleCategory: string | undefined;
    if (pathname && pathname.startsWith('/article/')) {
      articleSlug = pathname.replace('/article/', '').split('/')[0];
      const domCat = document
        .querySelector('[data-article-category]')
        ?.getAttribute('data-article-category');
      if (domCat) articleCategory = domCat;
    } else if (pathname && pathname.startsWith('/category/')) {
      articleCategory = pathname.replace('/category/', '').split('/')[0];
    }

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || undefined;
    const utmMedium = params.get('utm_medium') || undefined;
    const utmCampaign = params.get('utm_campaign') || undefined;

    const alreadyLanded = getSessionStorage('pnn_landed') === '1';
    const isLanding = !alreadyLanded || Boolean(utmSource);
    if (!alreadyLanded) {
      setSessionStorage('pnn_landed', '1');
    }
    const storedFirstChannel = getSessionStorage('pnn_first_channel') || undefined;

    const initialPayload = {
      type: 'pageview',
      pageViewId,
      sessionId,
      pathname,
      articleSlug,
      articleCategory,
      referrer: initialReferrerRef.current,
      utmSource,
      utmMedium,
      utmCampaign,
      isLanding,
      firstChannelGroup: storedFirstChannel,
      dwellTimeSeconds: 0,
      scrollDepthPercent: 0,
    };

    // 1. Initial Page View Beacon (persist session's first non-INTERNAL channel)
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload),
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (
          res?.channelGroup &&
          res.channelGroup !== 'INTERNAL' &&
          (!storedFirstChannel || Boolean(utmSource))
        ) {
          setSessionStorage('pnn_first_channel', String(res.channelGroup));
        }
      })
      .catch(() => {});

    // Forward page view to Google Tag Manager / GA4 dataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        article_slug: articleSlug,
        article_category: articleCategory,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      });
    }

    // Subsequent internal pages carry internal referrer while retaining pnn_first_channel
    initialReferrerRef.current = window.location.href;

    // 2. Scroll Depth Monitor (measures [data-article-body] when on articles)
    const computeScrollPct = () => {
      const articleEl = document.querySelector('[data-article-body]') as HTMLElement | null;
      if (articleEl) {
        const rect = articleEl.getBoundingClientRect();
        const elTop = rect.top + window.scrollY;
        const elHeight = Math.max(articleEl.offsetHeight, 1);
        const visibleBottom = window.scrollY + window.innerHeight;
        return Math.max(0, Math.min(100, Math.round(((visibleBottom - elTop) / elHeight) * 100)));
      }
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        1
      );
      return Math.max(
        0,
        Math.min(100, Math.round(((window.scrollY + window.innerHeight) / docHeight) * 100))
      );
    };

    const handleScroll = () => {
      const pct = computeScrollPct();
      if (pct > maxScrollRef.current) {
        maxScrollRef.current = pct;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    let milestoneSent = false;
    const sendEngagedUpdate = (isClosing: boolean) => {
      const secs = activeSecondsRef.current;
      const scroll = maxScrollRef.current;
      // Avoid noisy updates on sub-second accidental hits unless closing active presence
      if (!isClosing && secs < 2 && scroll < 10) return;
      const flushKey = `${secs}:${scroll}:${isClosing ? 1 : 0}`;
      if (lastFlushedKeyRef.current === flushKey) return;
      lastFlushedKeyRef.current = flushKey;

      const payload = {
        type: 'heartbeat',
        pageViewId,
        sessionId,
        pathname,
        articleSlug,
        dwellTimeSeconds: secs,
        scrollDepthPercent: scroll,
        isClosing,
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
    };

    // 3. Local Active Dwell Counter + single 60s active presence milestone (low Fluid CPU)
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        activeSecondsRef.current += 1;
        if (activeSecondsRef.current === 60 && !milestoneSent) {
          milestoneSent = true;
          sendEngagedUpdate(false);
        }
      }
    }, 1000);

    // 4. Flush once on tab leave / unload / route exit and mark presence closed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendEngagedUpdate(true);
      }
    };
    const handlePageHide = () => sendEngagedUpdate(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      sendEngagedUpdate(true);
    };
  }, [pathname]);

  return null;
}

export function TelemetryTracker() {
  return (
    <Suspense fallback={null}>
      <TelemetryTrackerInner />
    </Suspense>
  );
}
