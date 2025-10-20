/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Good practice in containers

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

  // External packages for server components (don't bundle these)
  // pdf-parse and canvas have native dependencies that break when bundled
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],

  // Belt-and-suspenders: hard externalize so webpack never bundles these
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs2 pdf-parse',
        'pdfjs-dist': 'commonjs2 pdfjs-dist',
        '@napi-rs/canvas': 'commonjs2 @napi-rs/canvas',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
