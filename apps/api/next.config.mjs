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

          { key: "Access-Control-Allow-Origin", value: "https://grupo-j-admin.vercel.app" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Idempotency-Key, X-Request-ID, X-Client-Version"
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" }
        ]
      }
    ];
  }
};

export default nextConfig;
