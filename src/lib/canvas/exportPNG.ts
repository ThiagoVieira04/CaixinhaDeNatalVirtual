import type { ArtworkConfig } from "../studio/types";
import { renderArtworkDataUrl } from "./renderArtwork";

export function slugifyBusinessName(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "sua-empresa"
  );
}

export function artworkFileName(config: ArtworkConfig): string {
  return `arte-natal-${slugifyBusinessName(config.businessName)}.png`;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = /data:([^;]+)/.exec(header);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function generateArtworkDataUrl(
  config: ArtworkConfig,
): Promise<string> {
  return renderArtworkDataUrl(config);
}

export type ShareResult = "shared" | "downloaded" | "cancelled" | "error";

export async function shareArtwork(
  dataUrl: string,
  config: ArtworkConfig,
): Promise<ShareResult> {
  const fileName = artworkFileName(config);

  if (typeof navigator === "undefined") return "error";

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], fileName, { type: "image/png" });

    let canShareFiles = false;
    try {
      canShareFiles =
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });
    } catch {
      canShareFiles = false;
    }

    if (typeof navigator.share === "function" && canShareFiles) {
      try {
        await navigator.share({
          files: [file],
          title: "Arte de Natal",
          text: "Confira a arte da nossa caixinha de Natal.",
        });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return "cancelled";
        }
        downloadDataUrl(dataUrl, fileName);
        return "downloaded";
      }
    }

    downloadDataUrl(dataUrl, fileName);
    return "downloaded";
  } catch {
    return "error";
  }
}
