import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io" }],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },
  // Add your ngrok/dev tunnel host here when testing webhooks locally:
    allowedDevOrigins: ["wealthy-upright-glider.ngrok-free.app"],
};

export default nextConfig;
