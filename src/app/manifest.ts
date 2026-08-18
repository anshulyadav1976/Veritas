import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Veritas", short_name: "Veritas", description: "Evidence-first news reader", start_url: "/", display: "standalone", background_color: "#f7f8f6", theme_color: "#f7f8f6", icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }] };
}
