const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://grupo-j-api.vercel.app https://*.vercel.app https://va.vercel-scripts.com;
  worker-src 'self';
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

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
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
