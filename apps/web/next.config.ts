import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@idenium/shared", "@idenium/sdk"],
  webpack: (config) => {
    // Support WASM modules (needed for ZK proof verification)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
