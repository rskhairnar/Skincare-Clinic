/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 
    unoptimized: true 
  },
  // This fixes everything
  output: 'standalone',
  
  // Skip static generation for all pages
  staticPageGenerationTimeout: 0,
  
  // Disable static export
  trailingSlash: false,
};

export default nextConfig;