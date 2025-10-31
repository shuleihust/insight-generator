/** @type {import('next').NextConfig} */
const nextConfig = {
  // 改善开发环境的热重载
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 优化开发环境的模块热替换
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig

