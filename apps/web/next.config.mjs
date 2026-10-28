/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@focient/contracts', '@focient/ui-tokens'],
};

export default nextConfig;
