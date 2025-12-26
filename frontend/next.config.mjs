/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy to Backend
      },
      // Map specific backend routes if they are accessed directly without /api prefix in frontend code
      {
        source: '/produtos/:path*',
        destination: 'http://localhost:3001/produtos/:path*',
      },
      {
        source: '/vendas/:path*',
        destination: 'http://localhost:3001/vendas/:path*',
      },
       {
        source: '/clientes/:path*',
        destination: 'http://localhost:3001/clientes/:path*',
      },
    ]
  },
}

export default nextConfig
