/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  async rewrites() {
    return [
        {
            source: '/client/pages/:page',
            destination: '/client/pages/:page',
        },
        {
            source: '/client/:page',  
            destination: '/client/:page',
        },
    ]
},
}

export default nextConfig