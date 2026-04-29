/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Disable Turbopack for production builds (crashes on Windows with React Compiler)
  experimental: {
    turbo: {
      rules: {},
    },
  },
  // Proxy all /api/* requests to the Express backend on localhost:5000
  // → Browser hits http://yoursite:3000/api/auth/login
  // → Next.js internally proxies to http://localhost:5000/api/auth/login
  // → No need to expose port 5000 in the security group
  // → No CORS issues (same-origin requests)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
  images:{
    remotePatterns:[
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
    loader:"custom",
    loaderFile:"./lib/imageLoader.js"
  }
};

export default nextConfig;
