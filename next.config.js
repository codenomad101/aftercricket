/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'g.cricapi.com',
      },
      {
        protocol: 'https',
        hostname: 'h.cricapi.com',
      },
    ],
  },
}

module.exports = nextConfig



