import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: new URL("../", import.meta.url).pathname,
};

initOpenNextCloudflareForDev();

export default nextConfig;
