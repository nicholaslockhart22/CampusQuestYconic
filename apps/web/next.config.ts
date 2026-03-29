import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/feed", destination: "/quad", permanent: false },
      { source: "/guilds", destination: "/friends", permanent: false },
      { source: "/inventory", destination: "/profile", permanent: false },
      { source: "/quests", destination: "/battle", permanent: false }
    ];
  }
};

export default nextConfig;
