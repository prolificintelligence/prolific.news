import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fox: {
          navy: '#002B49',
          darkNavy: '#001A2C',
          lightNavy: '#0A3F66',
          red: '#CC0000',
          brightRed: '#E50914',
          yellow: '#FFCC00',
        },
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'Oswald', 'Roboto Condensed', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        serif: ['var(--font-serif)', 'Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
