/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 
    unoptimized: true 
  },
  // Don't output as standalone or export
  // Leave default for Netlify
};

export default nextConfig;