import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mzansi Word",
    short_name: "MzansiWord",
    description:
      "SA's free daily word game — isiXhosa & English. Solve it and you're in the airtime draw.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1210",
    theme_color: "#0b1210",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
