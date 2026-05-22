/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // generates static HTML/CSS/JS in /out folder
  trailingSlash: true,       // needed for Hostinger file-based routing
  images: {
    unoptimized: true,       // required for static export
    domains: ['img.youtube.com', 'i.ytimg.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
}

module.exports = nextConfig
