/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["flgyxjpzekixwrtaolnh.supabase.co"],
  },
};

export default nextConfig;
