import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { archivoNarrow, caveatBrush, gloriaHallelujah } from "@/lib/fonts";
import RouteLoaderOverlay from "@/components/ui/RouteLoaderOverlay";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  colorScheme: "light",
};

// Vivabox is Spanish-only: prevent Chrome/Google from offering an
// automatic translation, which breaks the layout (translated copy
// is often longer than the Spanish it was designed for).
export const metadata: Metadata = {
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jakarta.variable} ${caveatBrush.variable} ${gloriaHallelujah.variable} ${archivoNarrow.variable}`}>
      <body className="font-sans notranslate">
        <RouteLoaderOverlay />
        {children}
      </body>
    </html>
  );
}