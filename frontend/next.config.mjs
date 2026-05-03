/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Disable Turbopack for production builds (crashes on Windows with React Compiler)
  turbo: {
    rules: {},
  },
  // Proxy all /api/* requests to the Express backend on localhost:5000
  // → Browser hits http://yoursite:3000/api/auth/login
  // → Next.js internally proxies to http://localhost:5000/api/auth/login
  // → No need to expose port 5000 in the security group
  // → No CORS issues (same-origin requests)
  // =========================================================================
  // ⚠️ ARCHITECTURE NOTE: PROXY ROUTING
  // =========================================================================
  // In PRODUCTION: Nginx acts as the primary reverse proxy and catches all 
  // /api/* traffic, routing it directly to port 5000. These Next.js rewrites
  // are completely BYPASSED in production environments.
  //
  // In LOCAL DEV: Because Nginx is not running, these Next.js rewrites act
  // as the fallback proxy to ensure local requests reach localhost:5000 
  // without CORS issues.
  // =========================================================================

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [

      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.amazonaws.com" }, // for S3

    ],
    loader: "custom",
    loaderFile: "./lib/imageLoader.js"
  }
};

export default nextConfig;
