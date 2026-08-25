import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "motovolt-8klfp.ondigitalocean.app" },
      // Change when switched to main domain
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },
  // Add your ngrok/dev tunnel host here when testing webhooks locally:
  allowedDevOrigins: [
    "wealthy-upright-glider.ngrok-free.app", 
    "shop.motovolt.co"
  ],
} as NextConfig & { allowedDevOrigins?: string[] }; // Added type intersection to prevent TS strict mode errors

export default nextConfig;