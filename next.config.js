/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Configure images
  images: {
    domains: ['localhost'],
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
