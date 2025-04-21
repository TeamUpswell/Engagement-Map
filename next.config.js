/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/repo-name' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/repo-name/' : '',
};

module.exports = nextConfig;
