import React from 'react';
import { Users } from 'lucide-react';
import { LiveStreamPlayer } from '../../components/LiveStreamPlayer';

const LIVE_STREAM_M3U8 =
  'https://go5lm6a6dawb-hls-live.5centscdn.com/translation2/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8';

export default function WatchLivePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Live Stream Main Frame */}
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-[#002B49]">
        <div className="bg-[#001A2C] px-4 py-3 flex items-center justify-between text-white text-xs font-headline font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              On Air Now
            </span>
            <span className="text-gray-300">Prolific News Channel Live Feed</span>
          </div>
          <div className="flex items-center gap-4 text-[#FFCC00]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              142,890 Watching
            </span>
          </div>
        </div>

        {/* Live Stream HLS Video Player */}
        <div className="aspect-video w-full bg-black">
          <LiveStreamPlayer
            streamUrl={LIVE_STREAM_M3U8}
            autoPlay={true}
            showChyron={true}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Broadcast Programming Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F8F9FA] border-t-4 border-[#002B49] p-5 rounded space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Upcoming at 2:00 PM EST</span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">The Daily Briefing</h3>
          <p className="text-xs text-gray-600">In-depth breakdown of midday press conferences, corporate earnings, and Pentagon updates.</p>
        </div>

        <div className="bg-[#F8F9FA] border-t-4 border-[#CC0000] p-5 rounded space-y-2">
          <span className="text-[11px] font-bold text-[#CC0000] uppercase">Upcoming at 5:00 PM EST</span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">The Five at 5</h3>
          <p className="text-xs text-gray-600">Fast-paced roundtable discussion debating the day’s top political and cultural controversies.</p>
        </div>

        <div className="bg-[#F8F9FA] border-t-4 border-[#FFCC00] p-5 rounded space-y-2">
          <span className="text-[11px] font-bold text-[#002B49] uppercase">Primetime 8:00 PM EST</span>
          <h3 className="font-headline font-black text-lg text-gray-900 uppercase">Prolific News Primetime Debate</h3>
          <p className="text-xs text-gray-600">High-intensity interviews with lawmakers, industry titans, and defense leaders.</p>
        </div>
      </div>
    </div>
  );
}
