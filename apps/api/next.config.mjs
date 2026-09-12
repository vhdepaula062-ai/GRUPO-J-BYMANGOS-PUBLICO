/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@grupo-j/types",
    "@grupo-j/domain",
    "@grupo-j/validation",
    "@grupo-j/security",
    "@grupo-j/payments",
    "@grupo-j/observability",
    "@grupo-j/config",
    "@grupo-j/database"
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Idempotency-Key, X-Request-ID, X-Client-Version"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
