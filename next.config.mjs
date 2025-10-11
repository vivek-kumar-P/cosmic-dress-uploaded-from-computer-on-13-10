/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use a separate build directory to avoid locked .next folder issues on Windows
  distDir: ".next-dev",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
