/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@grupo-j/types",
    "@grupo-j/design-tokens",
    "@grupo-j/ui-web",
    "@grupo-j/domain",
    "@grupo-j/validation",
    "@grupo-j/config",
    "@grupo-j/database"
  ]
};

export default nextConfig;
