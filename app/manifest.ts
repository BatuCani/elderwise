import type { MetadataRoute } from "next";

// Lets people add Elderwise to their home screen and open it full screen, like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elderwise",
    short_name: "Elderwise",
    description: "Show it, say it, understand it: a patient voice AI companion for older adults.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F1EA",
    theme_color: "#F4F1EA",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // The orb sits well inside the safe zone, so the same image works as a maskable icon.
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
