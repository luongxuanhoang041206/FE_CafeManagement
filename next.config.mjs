/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Bỏ output: 'standalone' đi!
  async rewrites() {
    return [
      {
        source: '/reset-password',
        destination: '/client/pages/reset-password.html',
      },
      {
        source: '/forgot-password',
        destination: '/client/pages/forgot-password.html',
      },
      {
        source: '/client/:path*',
        destination: '/client/:path*',
      },
    ]
  },
}

export default nextConfig
