'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Mail,
  Check,
  ChevronRight,
  SlidersHorizontal,
  X,
  ArrowRight,
} from 'lucide-react';
import { Article } from '@prolific/types';
import { trackTelemetryEvent } from './TelemetryTracker';

interface PersonalizedNewsWidgetProps {
  articles: Article[];
  mode?: 'modal' | 'inline';
}

const AVAILABLE_TOPICS = [
  'Politics',
  'Business',
  'Tech',
  'World',
  'Africa',
  'Asia',
  'LatAm',
  'Sports',
  'Opinion',
];

export function PersonalizedNewsWidget({
  articles,
  mode = 'modal',
}: PersonalizedNewsWidgetProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Politics',
    'Business',
    'Tech',
  ]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attentionPulse, setAttentionPulse] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('prolific_pref_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedTopics(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Periodic attention animation every 5 seconds for the slim 1-line bar
  useEffect(() => {
    if (mode !== 'modal') return;
    const interval = setInterval(() => {
      setAttentionPulse(true);
      setTimeout(() => setAttentionPulse(false), 1600);
    }, 5500);
    return () => clearInterval(interval);
  }, [mode]);

  // Listen for global 'open-personalized-modal' events triggered by TopHeader "For You" button
  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('open-personalized-modal', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-personalized-modal', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleTopic = (topic: string) => {
    let next: string[];
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) return;
      next = selectedTopics.filter((t) => t !== topic);
    } else {
      next = [...selectedTopics, topic];
    }
    setSelectedTopics(next);
    try {
      localStorage.setItem('prolific_pref_topics', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    setSubscribeStatus(null);

    try {
      const res = await fetch('/api/subscribe/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          topics: selectedTopics,
          regions: selectedTopics.filter((t) =>
            ['Africa', 'Asia', 'LatAm'].includes(t)
          ),
          frequency: 'DAILY_MORNING',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribeStatus('Subscribed! Your custom morning digest is locked in.');
        setEmail('');
        trackTelemetryEvent('newsletter_signup', null, {
          placement: 'personalized_widget',
          topicsCount: selectedTopics.length,
        });
      } else {
        setSubscribeStatus(data.error || 'Subscription failed.');
      }
    } catch {
      setSubscribeStatus('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredArticles = articles
    .filter((a) => {
      const cat = (a.category || '').toLowerCase();
      return selectedTopics.some((t) => {
        const tLower = t.toLowerCase();
        return (
          cat === tLower ||
          a.tags.some((tag) => tag.toLowerCase() === tLower) ||
          (tLower === 'latam' && (cat.includes('latin') || cat.includes('latam')))
        );
      });
    })
    .slice(0, 4);

  const displayList =
    filteredArticles.length > 0 ? filteredArticles : articles.slice(0, 4);

  const renderCuratedContent = (isInsideModal: boolean) => (
    <div
      className={`bg-gradient-to-br from-[#001F35] via-[#002B49] to-[#001524] text-white rounded-xl p-6 border-2 border-[#004A80] shadow-2xl ${
        isInsideModal ? 'w-full max-w-4xl max-h-[90vh] overflow-y-auto relative' : 'my-6'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#003B66]">
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFCC00] text-[#002B49] text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3 text-[#002B49]" />
              Personalized News Engine
            </span>
            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
              Delivered To You
            </span>
          </div>
          <h2 className="font-headline font-black text-xl md:text-2xl text-white uppercase tracking-tight">
            Curated For Your Desk & Regional Interests
          </h2>
          <p className="text-xs text-gray-300">
            Select the beats you follow. The newsroom dynamically scores and filters high-value dispatches for your profile.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/for-you"
            onClick={() => setIsModalOpen(false)}
            className="flex items-center gap-1.5 text-xs font-headline font-bold text-[#FFCC00] hover:text-white uppercase tracking-wider bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Full Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {isInsideModal && (
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-[#CC0000] text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Topic Pills */}
      <div className="pt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
          Active Beats:
        </span>
        {AVAILABLE_TOPICS.map((topic) => {
          const isActive = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`text-xs font-headline font-bold uppercase px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#CC0000] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{topic}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {displayList.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            onClick={() => setIsModalOpen(false)}
            className="group bg-[#001828]/80 hover:bg-[#001828] border border-[#003B66] hover:border-[#FFCC00] rounded p-3.5 flex flex-col justify-between transition space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-[#FFCC00]">{article.category}</span>
                <span className="bg-[#CC0000]/20 text-[#FF8080] px-1.5 py-0.5 rounded text-[9px] font-mono">
                  {article.valueScore || 85}% MATCH
                </span>
              </div>
              <h3 className="font-headline font-bold text-sm text-white group-hover:text-[#FFCC00] transition line-clamp-2 leading-snug">
                {article.title}
              </h3>
              <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                {article.subtitle}
              </p>
            </div>
            <div className="text-[10px] text-gray-400 font-mono pt-2 border-t border-white/10 flex items-center justify-between">
              <span>{article.author.name}</span>
              <span>{article.readTimeMinutes} min read</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Delivery Signup Callout */}
      <div className="mt-5 pt-4 border-t border-[#003B66] flex flex-col md:flex-row items-center justify-between gap-4 bg-black/30 p-4 rounded">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0 shadow">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm uppercase text-white">
              Deliver This Custom Feed To Your Inbox Every Morning
            </h4>
            <p className="text-xs text-gray-300">
              Personalized Morning Executive Briefing delivered at 7:00 AM in your local timezone. Zero spam.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="flex w-full md:w-auto items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your executive email"
            required
            className="w-full md:w-64 bg-white text-gray-900 text-xs px-3 py-2 rounded focus:outline-none placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#CC0000] hover:bg-[#B30000] disabled:opacity-60 text-white font-headline font-bold text-xs uppercase px-4 py-2 rounded whitespace-nowrap transition shadow"
          >
            {isSubmitting ? 'Saving...' : 'Deliver to Me'}
          </button>
        </form>
      </div>

      {subscribeStatus && (
        <div className="mt-2 text-center text-xs font-headline font-bold text-emerald-400 bg-emerald-950/60 p-2 rounded border border-emerald-800">
          {subscribeStatus}
        </div>
      )}
    </div>
  );

  if (mode === 'inline') {
    return renderCuratedContent(false);
  }

  return (
    <>
      {/* Slim 1-Line Periodically Animated Trigger Bar (Zero Landing Page Distortion) */}
      <div className="w-full bg-gradient-to-r from-[#001A2C] via-[#002B49] to-[#001A2C] border-b border-[#003B66] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`group flex-1 flex items-center justify-between gap-3 text-left transition-all duration-500 rounded px-2.5 py-1 ${
              attentionPulse
                ? 'bg-[#FFCC00]/15 ring-1 ring-[#FFCC00] shadow-[0_0_18px_rgba(255,204,0,0.35)] scale-[1.005]'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-headline font-black uppercase tracking-wider shrink-0 transition-transform duration-500 ${
                  attentionPulse
                    ? 'bg-[#CC0000] text-white scale-105 shadow'
                    : 'bg-[#FFCC00] text-[#002B49]'
                }`}
              >
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                <span>For Your Desk</span>
              </span>

              <span className="font-headline font-bold text-xs sm:text-sm text-white uppercase tracking-wide truncate group-hover:text-[#FFCC00] transition">
                Curate Your Desk & Morning Briefing
              </span>

              <div className="hidden md:flex items-center gap-1.5 ml-1">
                {selectedTopics.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-cyan-200 border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[11px] font-headline font-black uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1 transition-all duration-500 ${
                  attentionPulse
                    ? 'bg-[#FFCC00] text-[#002B49]'
                    : 'bg-[#CC0000] text-white group-hover:bg-[#FFCC00] group-hover:text-[#002B49]'
                }`}
              >
                <span>Personalize Feed</span>
                <ArrowRight
                  className={`w-3 h-3 transition-transform duration-300 ${
                    attentionPulse ? 'translate-x-1' : 'group-hover:translate-x-0.5'
                  }`}
                />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          {renderCuratedContent(true)}
        </div>
      )}
    </>
  );
}
