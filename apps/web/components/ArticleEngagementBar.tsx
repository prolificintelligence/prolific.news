'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Square,
  Share2,
  Check,
  Bookmark,
  Send,
  Copy,
} from 'lucide-react';

interface ArticleEngagementBarProps {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  plainTextContent: string;
}

export function ArticleEngagementBar({
  slug,
  title,
  subtitle,
  category,
  plainTextContent,
}: ArticleEngagementBarProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const shareUrl = `https://prolific.news/article/${slug}`;
  const shareText = `${title} — via @prolificnews`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pnn_saved_articles') || '[]');
      setBookmarked(saved.includes(slug));
    } catch {
      // ignore storage errors
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [slug]);

  const toggleAudioBriefing = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const script = `Prolific News Network ${category} Dispatch. ${title}. ${
      subtitle ? subtitle + '. ' : ''
    }${plainTextContent.slice(0, 1800)}`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.03;
    utterance.pitch = 0.98;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(
        localStorage.getItem('pnn_saved_articles') || '[]'
      );
      const next = saved.includes(slug)
        ? saved.filter((s) => s !== slug)
        : [...saved, slug];
      localStorage.setItem('pnn_saved_articles', JSON.stringify(next));
      setBookmarked(next.includes(slug));
    } catch {
      // ignore
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Audio Dispatch Briefing Player */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleAudioBriefing}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded font-headline font-bold text-xs uppercase tracking-wider transition shadow-sm ${
            isPlayingAudio
              ? 'bg-[#CC0000] text-white'
              : 'bg-[#002B49] hover:bg-[#003B66] text-white'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop Audio Dispatch</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#FFCC00]" />
              <span>Listen to Dispatch</span>
            </>
          )}
        </button>
        <span className="text-[11px] text-gray-500 font-medium hidden md:inline">
          {isPlayingAudio
            ? 'Playing PNN Voice Briefing...'
            : 'AI Broadcast Audio Briefing (~1 min)'}
        </span>
      </div>

      {/* Multi-Platform Social Share Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
          <Share2 className="w-3 h-3" /> Share:
        </span>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black hover:bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition"
          title="Share on X (@prolificnews)"
        >
          X
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(
            shareUrl
          )}&text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0088cc] hover:opacity-90 text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition"
          title="Share on Telegram"
        >
          <Send className="w-3 h-3" /> Telegram
        </a>
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `${shareText} ${shareUrl}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:opacity-90 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition"
          title="Share on WhatsApp"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0A66C2] hover:opacity-90 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition"
          title="Share on LinkedIn"
        >
          in
        </a>
        <button
          onClick={copyLink}
          className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition"
          title="Copy article link"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
        <button
          onClick={toggleBookmark}
          className={`border text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition ${
            bookmarked
              ? 'bg-[#FFCC00]/20 border-[#FFCC00] text-[#002B49]'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          title="Save to Reading List"
        >
          <Bookmark className={`w-3 h-3 ${bookmarked ? 'fill-[#002B49]' : ''}`} />
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
