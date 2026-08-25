export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.vivabox.com.co/#organization",
        name: "Vivabox Colombia",
        url: "https://www.vivabox.com.co/",
        logo: {
          "@type": "ImageObject",
          url: "https://www.vivabox.com.co/icons/logo.webp",
        },
        sameAs: [
          "https://www.instagram.com/vivaboxcolombia/",
          "https://www.linkedin.com/company/vivabox-colombia",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.vivabox.com.co/#website",
        url: "https://www.vivabox.com.co/",
        name: "Vivabox Colombia",
        publisher: {
          "@id": "https://www.vivabox.com.co/#organization",
        },
        inLanguage: "es-CO",
      },
    ],
  }
}