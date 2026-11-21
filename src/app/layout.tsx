import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioProvider } from "@/components/studio/StudioProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caixinha Virtual | Estúdio de Artes",
  description:
    "Estúdio de Artes da Caixinha de Natal Virtual: crie, personalize e baixe sua arte de divulgação.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <StudioProvider>{children}</StudioProvider>
      </body>
    </html>
  );
}
