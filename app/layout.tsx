import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SetReady — Film & TV Crew Marketplace Philippines",
  description: "Connect with verified directors, cinematographers, editors, sound designers, and more. The crew marketplace built for Philippine film and TV production.",
  openGraph: {
    title: "SetReady",
    description: "The crew marketplace for Philippine film & TV.",
    siteName: "SetReady",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
