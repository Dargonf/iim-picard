import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default nextConfig;
