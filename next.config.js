/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["openai"],
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Webpack 구성을 통해 Node.js 모듈 처리
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 측 번들에서 서버 전용 모듈 제외
      config.resolve.fallback = {
        fs: false,
        path: false,
        module: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
