/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        perf_hooks: false,
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
