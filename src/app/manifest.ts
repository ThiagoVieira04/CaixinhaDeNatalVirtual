import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Caixinha Virtual - Natal Solidário",
    short_name: "Caixinha",
    description: "Crie sua caixinha de Natal, receba contribuições via PIX e personalize suas artes de divulgação.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#174b38",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
