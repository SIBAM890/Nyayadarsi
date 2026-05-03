/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel deployment
  output: 'standalone',
  // Disable image optimization if not needed (reduces build time)
  images: {
    unoptimized: true,
  },
  // API rewrites - proxies /api/* to backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nyayadarsi.onrender.com';
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
