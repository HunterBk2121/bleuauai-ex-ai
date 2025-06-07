/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add source directories to the module paths
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
}

export default nextConfig
