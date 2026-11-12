import React from 'react';
import { HeroLeadPackage } from '../components/HeroLeadPackage';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { PersonalizedNewsWidget } from '../components/PersonalizedNewsWidget';
import { getLeadAndFeaturedArticles, getLatestWireBulletins } from '../lib/news-service';
import { PUBLIC_DOMAIN_CATALOG } from '../lib/video-catalog';
import { VideoClip } from '@prolific/types';

export const revalidate = 300; // Refresh every 5 minutes

const VIDEO_CLIPS: VideoClip[] = PUBLIC_DOMAIN_CATALOG.slice(0, 3).map((item) => ({
  id: item.id,
  title: item.title,
  durationSeconds: item.durationSeconds || 1800,
  streamId: item.id,
  hlsPlaybackUrl: item.embedUrl,
  thumbnailUrl: item.poster || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  category: item.category,
  publishedAt: new Date().toISOString(),
}));

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

      {/* Slim 1-Line Animated Personalization Trigger Bar + Modal */}
      <PersonalizedNewsWidget articles={allArticles} mode="modal" />

      {/* 3-Column High-Density Grid */}
      <ThreeColumnLayout
        wireArticles={wireArticles}
        centerArticles={centerArticles}
        videoClips={VIDEO_CLIPS}
      />
    </div>
  );
}
