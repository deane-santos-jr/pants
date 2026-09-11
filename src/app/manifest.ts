import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PANTS",
    short_name: "PANTS",
    description: "Place, Animal, Name, Thing. Pass the phone, beat the timer.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff6fb",
    theme_color: "#ffb6d9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
