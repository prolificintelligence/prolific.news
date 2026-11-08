import React from 'react';
import { HeroLeadPackage } from '../components/HeroLeadPackage';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { getLeadAndFeaturedArticles, getLatestWireBulletins } from '../lib/news-service';
import { VideoClip } from '@prolific/types';

export const revalidate = 60; // Refresh every 60 seconds

const VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'v1',
    title: 'Watch: Washington bureau analysis of the Geneva accords and economic implications',
    durationSeconds: 264,
    streamId: 'cf-stream-01',
    hlsPlaybackUrl: 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    category: 'Politics',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'v2',
    title: 'Panel debate: Can independent energy grids sustain the AI infrastructure boom?',
    durationSeconds: 412,
    streamId: 'cf-stream-02',
    hlsPlaybackUrl: 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    category: 'Business',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'v3',
    title: 'Special Investigation: The evolving tactics of modern maritime defense operations',
    durationSeconds: 320,
    streamId: 'cf-stream-03',
    hlsPlaybackUrl: 'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    category: 'Military',
    publishedAt: new Date().toISOString(),
  },
];

export default async function HomePage() {
  const [{ leadArticle, centerArticles }, wireArticles] = await Promise.all([
    getLeadAndFeaturedArticles(),
    getLatestWireBulletins(10),
  ]);

  return (
    <div className="flex flex-col">
      {/* Super Hero Lead Package */}
      <HeroLeadPackage article={leadArticle} />

      {/* 3-Column High-Density Grid */}
      <ThreeColumnLayout
        wireArticles={wireArticles}
        centerArticles={centerArticles}
        videoClips={VIDEO_CLIPS}
      />
    </div>
  );
}
