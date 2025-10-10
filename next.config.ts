import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Only initialize OpenNext Cloudflare dev tools in development
if (process.env.NODE_ENV === "development") {
  // Dynamic import to avoid bundling this in production builds
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
