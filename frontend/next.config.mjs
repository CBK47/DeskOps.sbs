import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: new URL("../", import.meta.url).pathname,
};

if (process.env.DESKOPS_SELF_HOST !== "true") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
