"use client";

import { useEffect, useRef, useState } from "react";
import { renderArtwork } from "@/lib/canvas/renderArtwork";
import type { ArtworkConfig } from "@/lib/studio/types";

type ArtCanvasProps = {
  config: ArtworkConfig;
  className?: string;
};

export function ArtCanvas({ config, className }: ArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const configKey = JSON.stringify({
    template: config.template.key,
    businessName: config.businessName,
    message: config.message,
    secondary: config.secondary,
    cta: config.cta,
    logo: config.logo,
    photo: config.photo,
    theme: config.theme,
  });

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsReady(false);

    renderArtwork(canvas, config, () => cancelled)
      .then(() => {
        if (cancelled) return;
        setError(null);
        setIsReady(true);
      })
      .catch((renderError: unknown) => {
        if (cancelled) return;
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Não foi possível montar a prévia da arte.",
        );
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, attempt]);

  return (
    <div className={`art-canvas-wrap ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        className="art-canvas"
        role="img"
        aria-label="Prévia da arte de divulgação da caixinha"
      />
      {!isReady && !error ? (
        <span className="art-overlay">Gerando prévia…</span>
      ) : null}
      {error ? (
        <div className="art-overlay art-overlay-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-small btn-outline"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
    </div>
  );
}
