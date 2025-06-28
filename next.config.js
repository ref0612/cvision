/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Configure images
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Enable server actions
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'your-production-domain.com']
    }
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Configure webpack
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Configuración solo para el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false
      };
    }

    // Excluir archivos de IA del build de producción
    if (!dev) {
      config.module.rules.push({
        test: /src\/ai\/(dev|genkit)\.ts$/,
        use: 'null-loader'
      });
    }

    return config;
  },
  
  // Output standalone for better performance
  output: 'standalone',
  
  // Enable production browser source maps
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
