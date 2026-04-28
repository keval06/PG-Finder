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
