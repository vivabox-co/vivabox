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
  async headers() {
    return [
      // 3D box files (not fingerprinted): cache for a day so the prefetch is reused on click and on return visits.
      {
        source: "/3d/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ]
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