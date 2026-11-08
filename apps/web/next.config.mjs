/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@prolific/ui', '@prolific/types', '@prolific/db', '@prolific/jobs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
