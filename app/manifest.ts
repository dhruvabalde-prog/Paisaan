import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paisaan - DealFlow & Gigs Engine",
    short_name: "Paisaan",
    description: "Real-time client gig stream & rapid pitch engine.",
    start_url: "/",
    display: "standalone",
    background_color: "#059669",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
