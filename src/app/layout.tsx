import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "leaflet/dist/leaflet.css";
import "./globals.css";

// Readout font for the drone-mounted display + HUD labels.
// Exposed as a CSS var so the WebGL canvas texture can resolve the real family.
const techMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tech",
});

export const metadata: Metadata = {
  title: "SALVO | AI Water Rescue",
  description:
    "AI-powered autonomous drone system for water rescue. Detects distress, tracks targets, and deploys flotation devices in seconds.",
  keywords: ["water rescue", "drone", "AI", "object detection", "thermal imaging", "lifeguard"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SALVO",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={techMono.variable}>
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
