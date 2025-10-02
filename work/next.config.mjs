// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Tesseract.js worker 파일 복사
    if (isServer) {
      config.resolve.alias.canvas = false
    }
    return config
  },
}

export default nextConfig
