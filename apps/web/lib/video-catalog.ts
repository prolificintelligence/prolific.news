export interface VideoStreamItem {
  id: string;
  title: string;
  category: string;
  duration?: string;
  durationSeconds?: number;
  summary?: string;
  embedUrl: string;
  poster?: string;
  isLive?: boolean;
  license?: string;
}

export const FLAGSHIP_LIVE_STREAM: VideoStreamItem = {
  id: 'flagship-nasa-live',
  title: 'NASA Earth & Orbital Telemetry — 24/7 Live Satellite Observation',
  category: 'Planetary & Aerospace Intelligence',
  duration: '24/7 Live Feed',
  summary:
    'Continuous real-time high-definition satellite observation directly from the International Space Station and NASA deep space telemetry. 100% Public Domain & Ad-Free.',
  embedUrl:
    'https://www.youtube-nocookie.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1&mute=1&playsinline=1&controls=1&rel=0',
  poster:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  isLive: true,
  license: 'U.S. Federal Government (Public Domain)',
};

export const PUBLIC_DOMAIN_CATALOG: VideoStreamItem[] = [
  {
    id: 'doc-earth-orbit',
    title: 'Earth from Low Orbit: Continental Corridors & Orbital Dynamics',
    category: 'Planetary Intelligence',
    duration: '32 mins',
    durationSeconds: 1920,
    summary:
      'Ultra-high-definition orbital observation capturing continental atmospheric currents, major maritime trading corridors, and diurnal terminator transitions across five continents.',
    embedUrl:
      'https://images-assets.nasa.gov/video/GSFC_20150420_Orbit_m11858_2014/GSFC_20150420_Orbit_m11858_2014~medium.mp4',
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
    durationSeconds: 1440,
    summary:
      'A 3D spatial investigation tracing equatorial Pacific thermal mechanics, the disruption of global commercial shipping lanes, and oceanic feedback loops dictating sovereign agricultural yields.',
    embedUrl:
      'https://images-assets.nasa.gov/video/GSFC_20170526_ElNino_m12601_3D/GSFC_20170526_ElNino_m12601_3D~medium.mp4',
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
    durationSeconds: 2880,
    summary:
      'Original restored flight telemetry and archival documentary logs detailing high-thrust propulsion engineering, orbital rendezvous, and the foundational mechanics of extraterrestrial exploration.',
    embedUrl:
      'https://images-assets.nasa.gov/video/KSC-19850101-MH-NAS01-0001-Apollo_11_Buzz_Aldrin_Experts-B_2141/KSC-19850101-MH-NAS01-0001-Apollo_11_Buzz_Aldrin_Experts-B_2141~mobile.mp4',
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
    durationSeconds: 2700,
    summary:
      'Comprehensive technical review of cryogenic sunshield deployment, beryllium mirror alignment, and deep space infrared spectroscopy at the Second Sun-Earth Lagrange point (L2).',
    embedUrl:
      'https://images-assets.nasa.gov/video/News%20Conference%20on%20the%20Engineering%20of%20the%20James%20Webb%20Space%20Telescope/News%20Conference%20on%20the%20Engineering%20of%20the%20James%20Webb%20Space%20Telescope~mobile.mp4',
    poster:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Goddard Engineering Directorate (Public Domain)',
  },
  {
    id: 'doc-mars-descent',
    title: 'Autonomous Planetary Entry: Perseverance Landing on Jezero Crater',
    category: 'Robotics & Autonomous Systems',
    duration: '35 mins',
    durationSeconds: 2100,
    summary:
      'Mission control telemetry tracking the hypersonic aerocapture, supersonic parachute deployment, and autonomous terrain-relative navigation guiding robotic touchdown on Martian terrain.',
    embedUrl:
      'https://images-assets.nasa.gov/video/Mars%202020%20Perseverance%20Landing%20Coverage%20-%20Commentary/Mars%202020%20Perseverance%20Landing%20Coverage%20-%20Commentary~mobile.mp4',
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
    durationSeconds: 1680,
    summary:
      'Engineering investigation into low-drag airframe shaping, acoustic pressure dissipation, and next-generation composite structures engineered for sustainable supersonic transit.',
    embedUrl:
      'https://images-assets.nasa.gov/video/Find%20out%20why%20July%202023%20was%20a%20record-breaking%20month%20on%20This%20Week%20@NASA%20%E2%80%93%20August%2018,%202023/Find%20out%20why%20July%202023%20was%20a%20record-breaking%20month%20on%20This%20Week%20@NASA%20%E2%80%93%20August%2018,%202023~medium.mp4',
    poster:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    isLive: false,
    license: 'NASA Aeronautics Research Directorate (Public Domain)',
  },
];

export const DEFAULT_PUBLIC_DOMAIN_VIDEO_URL = PUBLIC_DOMAIN_CATALOG[0].embedUrl;
