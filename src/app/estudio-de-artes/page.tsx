import type { Metadata } from "next";
import { TemplateGallery } from "@/components/studio/TemplateGallery";

export const metadata: Metadata = {
  title: "Escolha um modelo | Estúdio de Artes",
};

export default function GalleryPage() {
  return <TemplateGallery />;
}
