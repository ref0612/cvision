/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Configure images
  images: {
    domains: ['localhost'],
    // Configuración para optimización de imágenes
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Deshabilitar Image Optimization API
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Enable server actions
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
  },
  
  // Configure webpack
  webpack: (config, { isServer, webpack }) => {
    // Fixes npm packages that depend on `node:` protocol
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      // Asegurar que los módulos de Node.js estén disponibles
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      // Añadir soporte para módulos de Node
      ...(isServer ? {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
        child_process: 'empty'
      } : {})
    };

    // Important: return the modified config
    return config;
  },
  
  // Output standalone for better performance
  output: 'standalone',
  
  // Enable production browser source maps
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
