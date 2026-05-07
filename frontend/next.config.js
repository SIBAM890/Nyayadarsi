/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel deployment
  output: 'standalone',
  // Disable image optimization if not needed (reduces build time)
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  // API rewrites - proxies /api/* to backend
  async rewrites() {
    // Determine the API URL: 
    // 1. Environment variable if set
    // 2. Localhost if in development mode
    // 3. Render URL as a production fallback
    const isDev = process.env.NODE_ENV === 'development';
    const defaultUrl = isDev ? 'http://localhost:8000' : 'https://nyayadarsi.onrender.com';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl;
    
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    return [
      {
        source: '/api/:path*',
        destination: `${cleanApiUrl}/api/:path*`,
      },
    ];
  },
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
};

module.exports = nextConfig;
