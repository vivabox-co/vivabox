import "./globals.css";
import type { Viewport } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jakarta.variable} ${caveatBrush.variable} ${gloriaHallelujah.variable} ${archivoNarrow.variable}`}>
      <body className="font-sans">
        <RouteLoaderOverlay />
        {children}
      </body>
    </html>
  );
}