import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SALVO | AI Water Rescue",
  description:
    "AI-powered autonomous drone system for water rescue. Detects distress, tracks targets, and deploys flotation devices in seconds.",
  keywords: [
    "water rescue",
    "drone",
    "AI",
    "object detection",
    "thermal imaging",
    "lifeguard",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
