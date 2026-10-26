/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@focient/contracts', '@focient/ui-tokens', '@focient/ui-token'],
};

export default nextConfig;
