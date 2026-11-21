import type { Metadata } from "next";
import { FinalArtwork } from "@/components/studio/FinalArtwork";

export const metadata: Metadata = {
  title: "Sua arte está pronta | Estúdio de Artes",
};

export default function ArtworkReadyPage() {
  return <FinalArtwork />;
}
