import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // El paso "entrega" del checkout se fusionó dentro de CheckoutStep
      // (commit 050e14c) — conserva cualquier enlace o marcador antiguo.
      {
        source: "/checkout/:slug/entrega",
        destination: "/checkout/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;