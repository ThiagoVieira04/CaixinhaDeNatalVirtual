import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StudioProvider } from "@/components/studio/StudioProvider";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#174b38",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Caixinha Virtual | Natal Solidário",
  description:
    "Crie sua caixinha de Natal, receba contribuições via PIX direto na sua conta e crie artes de divulgação para WhatsApp e Instagram.",
  applicationName: "Caixinha Virtual",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Caixinha Virtual",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
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
