'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Film,
  Radio,
  Play,
  Clock,
  Sparkles,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Send,
  Building2,
  FileText,
} from 'lucide-react';
import {
  LiveStreamPlayer,
  VideoStreamItem,
  FLAGSHIP_LIVE_STREAM,
} from '../../components/LiveStreamPlayer';

const PUBLIC_DOMAIN_CATALOG: VideoStreamItem[] = [
  {
    id: 'doc-earth-orbit',
    title: 'Earth from Low Orbit: Continental Corridors & Orbital Dynamics',
    category: 'Planetary Intelligence',
    duration: '32 mins',
    summary:
      'Ultra-high-definition orbital observation capturing continental atmospheric currents, major maritime trading corridors, and diurnal terminator transitions across five continents.',
    embedUrl:
      'https://images-assets.nasa.gov/video/GSFC_20150420_Orbit_m11858_2014/GSFC_20150420_Orbit_m11858_2014~large.mp4',
    poster:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'U.S. National Aeronautics and Space Administration (Public Domain)',
  },
  {
    id: 'doc-climate-ocean',
    title: 'Deep Ocean Dynamics: El Niño, Trade Winds & Global Maritime Shifts',
    category: 'Environmental Geopolitics',
    duration: '24 mins',
    summary:
      'A 3D spatial investigation tracing equatorial Pacific thermal mechanics, the disruption of global commercial shipping lanes, and oceanic feedback loops dictating sovereign agricultural yields.',
    embedUrl:
      'https://images-assets.nasa.gov/video/GSFC_20170526_ElNino_m12601_3D/GSFC_20170526_ElNino_m12601_3D~orig.mp4',
    poster:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Goddard Space Flight Center (Public Domain)',
  },
  {
    id: 'doc-apollo-master',
    title: 'The Moon & Beyond: Archival Apollo Mission Operations',
    category: 'Aerospace History & Sovereignty',
    duration: '48 mins',
    summary:
      'Original restored flight telemetry and archival documentary logs detailing high-thrust propulsion engineering, orbital rendezvous, and the foundational mechanics of extraterrestrial exploration.',
    embedUrl:
      'https://images-assets.nasa.gov/video/KSC-19850101-MH-NAS01-0001-Apollo_11_Buzz_Aldrin_Experts-B_2141/KSC-19850101-MH-NAS01-0001-Apollo_11_Buzz_Aldrin_Experts-B_2141~orig.mp4',
    poster:
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'Kennedy Space Center & U.S. National Archives (Public Domain)',
  },
  {
    id: 'doc-deep-space-webb',
    title: 'Deep Space Telemetry: James Webb Telescope Engineering Briefing',
    category: 'Space Tech & Astrophysics',
    duration: '45 mins',
    summary:
      'Comprehensive technical review of cryogenic sunshield deployment, beryllium mirror alignment, and deep space infrared spectroscopy at the Second Sun-Earth Lagrange point (L2).',
    embedUrl:
      'https://images-assets.nasa.gov/video/News%20Conference%20on%20the%20Engineering%20of%20the%20James%20Webb%20Space%20Telescope/News%20Conference%20on%20the%20Engineering%20of%20the%20James%20Webb%20Space%20Telescope~orig.mp4',
    poster:
      'https://images.unsplash.com/photo-1517976487468-f20514c44f53?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Goddard Engineering Directorate (Public Domain)',
  },
  {
    id: 'doc-mars-descent',
    title: 'Autonomous Planetary Entry: Perseverance Landing on Jezero Crater',
    category: 'Robotics & Autonomous Systems',
    duration: '35 mins',
    summary:
      'Mission control telemetry tracking the hypersonic aerocapture, supersonic parachute deployment, and autonomous terrain-relative navigation guiding robotic touchdown on Martian terrain.',
    embedUrl:
      'https://images-assets.nasa.gov/video/Mars%202020%20Perseverance%20Landing%20Coverage%20-%20Commentary/Mars%202020%20Perseverance%20Landing%20Coverage%20-%20Commentary~orig.mp4',
    poster:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Jet Propulsion Laboratory (Public Domain)',
  },
  {
    id: 'doc-aeronautics-future',
    title: 'Next-Generation Flight: Quiet Supersonic Boom & High-Altitude Physics',
    category: 'Applied Physics & Defense',
    duration: '28 mins',
    summary:
      'Engineering investigation into low-drag airframe shaping, acoustic pressure dissipation, and next-generation composite structures engineered for sustainable supersonic transit.',
    embedUrl:
      'https://images-assets.nasa.gov/video/Find%20out%20why%20July%202023%20was%20a%20record-breaking%20month%20on%20This%20Week%20@NASA%20–%20August%2018,%202023/Find%20out%20why%20July%202023%20was%20a%20record-breaking%20month%20on%20This%20Week%20@NASA%20–%20August%2018,%202023~orig.mp4',
    poster:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Aeronautics Research Directorate (Public Domain)',
  },
];

export default function WatchLivePage() {
  const [activeVideo, setActiveVideo] = useState<VideoStreamItem>(FLAGSHIP_LIVE_STREAM);
  const playerTopRef = useRef<HTMLDivElement | null>(null);

  // Email capture state
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribing(true);
    setSubscribeStatus('idle');

    try {
      const res = await fetch('/api/subscribe/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          topics: ['Politics', 'Business', 'Tech', 'Energy'],
          regions: ['Global'],
          frequency: 'DAILY_MORNING',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribeStatus('success');
        setSubscribeMsg('Subscribed! The Prolific Morning Briefing will arrive daily.');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMsg(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err: any) {
      setSubscribeStatus('error');
      setSubscribeMsg('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const selectVideo = (doc: VideoStreamItem) => {
    setActiveVideo(doc);
    if (playerTopRef.current) {
      playerTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const switchToLive = () => {
    setActiveVideo(FLAGSHIP_LIVE_STREAM);
    if (playerTopRef.current) {
      playerTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#00101C] text-white min-h-screen pb-16">
      {/* Top Discreet Header Bar */}
      <div className="border-b border-gray-800 bg-[#001829]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFCC00]" />
            <span>Back to Newsroom Wire</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-headline font-bold uppercase tracking-wider">
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Domain Sovereign Media</span>
            </span>

            {activeVideo.isLive ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Flagship Satellite 24/7</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#FFCC00]">
                <Film className="w-3.5 h-3.5" />
                <span>Feature Cinema</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-8" ref={playerTopRef}>
        {/* Cinema Screen Frame */}
        <div className="space-y-4">
          <LiveStreamPlayer item={activeVideo} className="shadow-[0_20px_50px_rgba(0,0,0,0.9)]" />

          {/* Active Feature Control & Metadata Bar */}
          <div className="bg-[#001E35] border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-headline font-bold uppercase px-2.5 py-0.5 rounded bg-[#CC0000] text-white tracking-wider">
                  {activeVideo.category}
                </span>
                {activeVideo.duration && (
                  <span className="text-xs font-mono text-[#FFCC00] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeVideo.duration}
                  </span>
                )}
                {activeVideo.license && (
                  <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {activeVideo.license}
                  </span>
                )}
              </div>
              <h1 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tight text-white">
                {activeVideo.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-300 font-serif leading-relaxed max-w-4xl">
                {activeVideo.summary}
              </p>
            </div>

            {!activeVideo.isLive && (
              <button
                onClick={switchToLive}
                className="shrink-0 bg-[#CC0000] hover:bg-rose-700 text-white font-headline font-black text-xs uppercase px-4 py-3 rounded tracking-wider transition flex items-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Return to 24/7 Live Satellite</span>
              </button>
            )}
          </div>
        </div>

        {/* Prolific Direct Revenue & Audience Conversion Desk */}
        <div className="bg-gradient-to-r from-[#00223A] via-[#002B49] to-[#001829] border border-[#004A80] rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFCC00] text-[#002B49] text-[10px] font-headline font-black uppercase px-2 py-0.5 rounded tracking-widest">
                  PROLIFIC INTELLIGENCE DESK
                </span>
                <span className="text-xs font-mono text-gray-400">Zero Commercial Ads • 100% Owned Media</span>
              </div>
              <h2 className="font-headline font-black text-xl md:text-2xl text-white uppercase tracking-tight">
                Institutional Analysis Delivered Every Morning
              </h2>
              <p className="text-xs md:text-sm text-gray-300 font-serif leading-relaxed">
                Join thousands of senior decision-makers receiving uncompromised global macroeconomic, defense, and sovereign technology intelligence before markets open.
              </p>
            </div>

            {/* Newsletter Conversion Input */}
            <div className="w-full lg:w-96 shrink-0">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-700 focus-within:border-[#FFCC00] transition shadow-inner bg-black/40">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@institution.com"
                    required
                    disabled={subscribing}
                    className="w-full bg-transparent px-3.5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-[#FFCC00] hover:bg-[#FFE066] text-[#002B49] px-5 text-xs font-headline font-black uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {subscribing ? (
                      <span className="animate-spin text-sm">⏳</span>
                    ) : (
                      <>
                        <span>Join</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {subscribeStatus === 'success' && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{subscribeMsg}</span>
                  </p>
                )}
                {subscribeStatus === 'error' && (
                  <p className="text-xs text-rose-400">{subscribeMsg}</p>
                )}
              </form>
            </div>
          </div>

          {/* Direct Revenue Inquiries Grid */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/contact?dept=partnerships"
              className="bg-[#001829]/70 hover:bg-[#001829] border border-white/10 hover:border-[#FFCC00]/50 p-4 rounded-lg transition flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded bg-[#FFCC00]/10 border border-[#FFCC00]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FFCC00]/20 transition">
                <Building2 className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-white group-hover:text-[#FFCC00] transition">
                    Sponsor The Broadcast Desk
                  </h3>
                  <span className="text-[10px] font-mono text-[#FFCC00] uppercase font-bold">Inquire</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Feature your brand or enterprise intelligence directly across Prolific Live and executive newsletters. Route to <span className="text-[#FFCC00] font-mono">partnerships@prolific.news</span>.
                </p>
              </div>
            </Link>

            <Link
              href="/contact?dept=wire"
              className="bg-[#001829]/70 hover:bg-[#001829] border border-white/10 hover:border-[#FFCC00]/50 p-4 rounded-lg transition flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded bg-[#CC0000]/10 border border-[#CC0000]/20 flex items-center justify-center shrink-0 group-hover:bg-[#CC0000]/20 transition">
                <FileText className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-white group-hover:text-[#FFCC00] transition">
                    Commercial Press Wire Syndication
                  </h3>
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">1h SLA</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Distribute compliant corporate disclosures and earnings releases across 50+ global downstream terminals. Route to <span className="text-rose-400 font-mono">wire@prolific.news</span>.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Curated Public Domain & Open-Access Features Catalog */}
        <div className="space-y-5 pt-4">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-headline font-black text-lg md:text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#FFCC00]" />
                Public Domain Special Investigations & Telemetry
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Full-length planetary, oceanic, aerospace, and robotics telemetry. Streamed without external advertising or third-party tracking.
              </p>
            </div>
            <span className="text-xs font-mono text-gray-400">
              6 Sovereign Public Domain Features
            </span>
          </div>

          {/* Documentary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PUBLIC_DOMAIN_CATALOG.map((doc) => {
              const isPlaying = activeVideo.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => selectVideo(doc)}
                  className={`group rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-[#002B49] border-[#FFCC00] shadow-2xl scale-[1.01]'
                      : 'bg-[#001A2C] border-gray-800 hover:border-gray-600 hover:bg-[#00223A]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Poster Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={doc.poster}
                        alt={doc.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Duration Tag */}
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-[#FFCC00] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                        {doc.duration}
                      </span>

                      {/* Category Tag */}
                      <span className="absolute top-2.5 left-2.5 bg-[#002B49]/90 text-white text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded tracking-wider">
                        {doc.category}
                      </span>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                        <div className="w-12 h-12 rounded-full bg-[#FFCC00] text-[#002B49] flex items-center justify-center shadow-xl">
                          <Play className="w-6 h-6 fill-[#002B49] translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-headline font-bold text-base text-white group-hover:text-[#FFCC00] transition line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-300 font-serif line-clamp-3 leading-relaxed">
                        {doc.summary}
                      </p>
                      <div className="pt-2 text-[10px] font-mono text-gray-400 truncate">
                        {doc.license}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      className={`w-full py-2 rounded text-xs font-headline font-bold uppercase tracking-wider transition cursor-pointer ${
                        isPlaying
                          ? 'bg-[#FFCC00] text-[#002B49]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isPlaying ? 'Currently Streaming in Cinema' : 'Stream Native MP4 in Cinema'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
