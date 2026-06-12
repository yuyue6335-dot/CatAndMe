import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata: Metadata = {
  title: "猫与回忆",
  description: "两个人的离线回忆地图与时间线。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "猫与回忆",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#4a8a55"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
