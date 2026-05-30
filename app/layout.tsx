import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import VersionChecker from "@/components/VersionChecker";

export const metadata: Metadata = {
  title: "CineForce powered by CineVerse — Your Next Set Is a Tap Away.",
  description: "The Philippines' first on-demand marketplace connecting film and media crew with productions. Find the right people for your project, or find your next gig.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineForce",
  },
  openGraph: {
    title: "CineForce powered by CineVerse",
    description: "Your Next Set Is a Tap Away.",
    siteName: "CineForce",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        {children}
        <BottomNav />
        <VersionChecker />
      </body>
    </html>
  );
}
