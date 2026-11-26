/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Import blog/project posts (src/content/**/*.md) as raw strings.
    config.module.rules.push({ test: /\.md$/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
