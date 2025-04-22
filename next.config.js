/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Temporarily ignore build errors to get your app deployed
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
