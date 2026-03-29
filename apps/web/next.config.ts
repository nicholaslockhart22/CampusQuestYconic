import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      /** Legacy URLs; assets live under `public/images/quad/`. */
      { source: "/quad-media/:path*", destination: "/images/quad/:path*" },
      { source: "/cq/:path*", destination: "/images/quad/:path*" }
    ];
  },
  async redirects() {
    return [
      { source: "/guilds", destination: "/friends", permanent: false },
      { source: "/inventory", destination: "/profile", permanent: false },
      { source: "/quests", destination: "/battle", permanent: false }
    ];
  }
};

export default nextConfig;
