/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
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
