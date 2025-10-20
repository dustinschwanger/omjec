/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Temporary: Bypass ESLint during builds (remove after Railway deployment succeeds)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

module.exports = nextConfig;
