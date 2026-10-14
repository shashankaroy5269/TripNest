/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Prevent ChunkLoadError timeouts during development on Windows
      config.output.chunkLoadTimeout = 300000; // 5 minutes
    }
    return config;
  },
};

export default nextConfig;
