/** @type {import('next').NextConfig} */
function hostnameFromUrl(maybeUrl) {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl).hostname;
  } catch {
    return null;
  }
}

const r2PublicHostname = hostnameFromUrl(process.env.R2_PUBLIC_URL);
const r2LinkAccessHostname = hostnameFromUrl(process.env.R2_LINK_ACCESS_BUCKET);
const allowedImageHostnames = Array.from(
  new Set([r2PublicHostname, r2LinkAccessHostname].filter(Boolean))
);

const nextConfig = {
  // Webpack config for Leaflet compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Image optimization
  images: {
    // Security: avoid wildcard hosts to prevent turning the server into an open image proxy.
    // Most app uploads are served via same-origin `/api/files/...` and don't need remotePatterns.
    remotePatterns: allowedImageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
  // Server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
