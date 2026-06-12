import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "猫与回忆",
    short_name: "猫与回忆",
    description: "两个人的离线回忆地图与时间线",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fbf7",
    theme_color: "#4a8a55",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
