/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 
    unoptimized: true 
  },
  output: 'standalone',
  
  // Disable all static page generation
  experimental: {
    isrFlushToDisk: false,
  },
  
  // Force all pages to be server-rendered
  async headers() {
    return [];
  },
};

export default nextConfig;