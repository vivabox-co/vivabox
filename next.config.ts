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
      // En-têtes de sécurité sur tout le site. Pas de CSP complète (GTM,
      // Wompi, tuiles de carte... la casseraient vite) : seulement les
      // directives sans risque. frame-ancestors 'self' empêche d'encadrer le
      // site ailleurs (clickjacking) tout en laissant la page de retour Wompi
      // s'afficher dans notre propre iframe de paiement.
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
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