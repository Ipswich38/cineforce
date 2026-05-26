import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "YourNextCrew — The Philippines' First Crew Network",
  description: "The Philippines' first platform built for every side of production. Find excellent crew for your project, or find the right job for your craft.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YourNextCrew",
  },
  openGraph: {
    title: "YourNextCrew",
    description: "The Philippines' first. Built for every side of production.",
    siteName: "YourNextCrew",
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
      </body>
    </html>
  );
}
