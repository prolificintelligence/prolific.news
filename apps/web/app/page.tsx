import React from 'react';
import { HeroLeadPackage } from '../components/HeroLeadPackage';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { PersonalizedNewsWidget } from '../components/PersonalizedNewsWidget';
import { getLeadAndFeaturedArticles, getLatestWireBulletins } from '../lib/news-service';
import { VideoClip } from '@prolific/types';

export const revalidate = 60; // Refresh every 60 seconds

const VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'v1',
    title: 'Watch: Washington and Geneva bureau analysis of strategic supply chains and defense pact',
    durationSeconds: 284,
    streamId: 'cf-stream-01',
    hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    category: 'Politics',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'v2',
    title: 'Panel debate: Can independent energy grids and microgrids sustain the global AI infrastructure surge?',
    durationSeconds: 340,
    streamId: 'cf-stream-02',
    hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    category: 'Business',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'v3',
    title: 'Special Investigation: Emerging African and Asian technology corridors driving global trade',
    durationSeconds: 310,
    streamId: 'cf-stream-03',
    hlsPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
    category: 'World',
    publishedAt: new Date().toISOString(),
  },
];

export default async function HomePage() {
  const [{ leadArticle, centerArticles }, wireArticles] = await Promise.all([
    getLeadAndFeaturedArticles(),
    getLatestWireBulletins(12),
  ]);

  const allArticles = [leadArticle, ...centerArticles].filter(Boolean);

  return (
    <div className="flex flex-col">
      {/* Super Hero Lead Package */}
      <HeroLeadPackage article={leadArticle} />

      {/* Personalized News "Delivered To You" Section */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <PersonalizedNewsWidget articles={allArticles} />
      </div>

      {/* 3-Column High-Density Grid */}
      <ThreeColumnLayout
        wireArticles={wireArticles}
        centerArticles={centerArticles}
        videoClips={VIDEO_CLIPS}
      />
    </div>
  );
}
