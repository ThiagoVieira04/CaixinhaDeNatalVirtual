import type { Metadata } from "next";
import { EditorWorkspace } from "@/components/studio/EditorWorkspace";

export const metadata: Metadata = {
  title: "Personalize sua arte | Estúdio de Artes",
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
