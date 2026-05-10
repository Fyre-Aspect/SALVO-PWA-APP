import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/context/AppContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
