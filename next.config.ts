import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to ./out
  output: "export",
  // /kalinchowk/index.html instead of /kalinchowk.html — works on any static host
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
