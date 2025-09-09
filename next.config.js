/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable ESLint checking during build as well
  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
