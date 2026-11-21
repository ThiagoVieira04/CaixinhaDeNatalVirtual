"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ImagesIcon,
  LightbulbIcon,
  LinkIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { StudioHeader } from "@/components/StudioHeader";
import {
  artworkFileName,
  downloadDataUrl,
  generateArtworkDataUrl,
  shareArtwork,
} from "@/lib/canvas/exportPNG";
import type { ArtworkConfig } from "@/lib/studio/types";
import { buildArtworkConfig, useStudio } from "./StudioProvider";

function FlashMessage({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}

function FinalArtworkContent({ config }: { config: ArtworkConfig }) {
  const { state, update, startNewArtwork } = useStudio();
  const router = useRouter();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

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
    setIsGenerating(true);
    setError(null);

    generateArtworkDataUrl(config)
      .then((url) => {
        if (cancelled) return;
        setDataUrl(url);
        setIsGenerating(false);
      })
      .catch((generationError: unknown) => {
        if (cancelled) return;
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Não foi possível gerar a arte. Tente novamente.",
        );
        setIsGenerating(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, attempt]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };

  const fileName = artworkFileName(config);
  const isReady = Boolean(dataUrl) && !isGenerating;

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, fileName);
    showToast("Download iniciado. Confira a pasta de downloads do seu aparelho.");
  };

  const handleShare = async () => {
    if (!dataUrl || isSharing) return;
    setIsSharing(true);
    const result = await shareArtwork(dataUrl, config);
    setIsSharing(false);

    if (result === "downloaded") {
      showToast(
        "Seu navegador não permite compartilhar arquivos. Baixamos a imagem para você anexar no WhatsApp.",
      );
    } else if (result === "shared") {
      showToast("Janela de compartilhamento aberta pelo navegador.");
    } else if (result === "error") {
      showToast("Não foi possível compartilhar. Tente baixar a imagem.");
    }
  };

  const copyText = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        return copied;
      } catch {
        return false;
      }
    }
  };

  const handleCopyLink = async () => {
    const link = state.campaignLink.trim();
    if (!link) {
      showToast("Informe o link da sua caixinha no campo abaixo para copiar.");
      linkInputRef.current?.focus();
      return;
    }
    const copied = await copyText(link);
    showToast(
      copied
        ? "Link copiado. Cole na legenda do seu Status."
        : "Não foi possível copiar automaticamente. Selecione o link e copie manualmente.",
    );
  };

  const handleCreateAnother = () => {
    startNewArtwork();
    router.push("/estudio-de-artes");
  };

  const handleLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    update({ campaignLink: event.target.value });
  };

  return (
    <main className="studio-page studio-page-wide">
      <StudioHeader
        backHref="/estudio-de-artes/editor"
        backLabel="Voltar e editar a arte"
        rightSlot={
          <Link href="/estudio-de-artes/editor" className="text-link">
            Editar arte
          </Link>
        }
      />

      <div className="final-grid">
        <section className="final-card final-download-card">
          <div className="final-preview">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="Arte de divulgação pronta para download"
                className="final-art"
              />
            ) : (
              <div className="art-skeleton" aria-label="Gerando arte" />
            )}
          </div>

          <div className="final-content">
            <span className="check-badge">
              <CheckIcon />
            </span>
            <h1>Sua arte está pronta!</h1>
            <p className="final-description">
              Faça o download ou compartilhe sua arte pelo WhatsApp.
            </p>

            <div className="final-buttons">
              <button
                type="button"
                className="btn btn-gold btn-block"
                onClick={handleDownload}
                disabled={!isReady}
              >
                <DownloadIcon />
                {isGenerating ? "Preparando arte…" : "Baixar Minha Arte"}
              </button>

              <button
                type="button"
                className="btn btn-whatsapp btn-block"
                onClick={handleShare}
                disabled={!isReady || isSharing}
              >
                <WhatsAppIcon />
                {isSharing ? "Abrindo…" : "Compartilhar pelo WhatsApp"}
              </button>

              <div className="divider-or">
                <span>ou</span>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={handleCopyLink}
              >
                <LinkIcon />
                Copiar Link da Caixinha
              </button>
            </div>

            {error ? (
              <div className="field-error" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  className="btn btn-small btn-outline"
                  onClick={() => setAttempt((current) => current + 1)}
                >
                  Tentar novamente
                </button>
              </div>
            ) : null}

            <p className="final-note">
              Para divulgar no WhatsApp Status, compartilhe a imagem e adicione
              o link da sua caixinha.
            </p>
          </div>
        </section>

        <section className="final-card final-share-card">
          <div className="phone-stage">
            <div className="phone">
              <span className="phone-notch" aria-hidden="true" />
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt="" className="phone-art" />
              ) : (
                <span className="phone-placeholder" />
              )}
            </div>
          </div>

          <div className="share-content">
            <span className="whatsapp-badge">
              <WhatsAppIcon />
            </span>
            <h2>Compartilhe sua arte!</h2>
            <p>
              Divulgue sua caixinha para amigos, clientes e comunidade.
            </p>

            <button
              type="button"
              className="btn btn-whatsapp-solid btn-block"
              onClick={handleShare}
              disabled={!isReady || isSharing}
            >
              <WhatsAppIcon />
              Compartilhar pelo WhatsApp
              <ArrowRightIcon />
            </button>

            <div className="tip-card">
              <LightbulbIcon />
              <p>
                <strong>Dica:</strong> você também pode baixar a imagem e
                publicar nos seus status.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="link-card">
        <div className="link-card-head">
          <span className="link-card-icon">
            <LinkIcon />
          </span>
          <div>
            <strong>Link da sua caixinha</strong>
            <span>Use este link na legenda do Status e dos Stories.</span>
          </div>
        </div>
        <div className="link-card-form">
          <input
            ref={linkInputRef}
            type="url"
            className="input"
            value={state.campaignLink}
            onChange={handleLinkChange}
            placeholder="https://caixinhavirtual.com/sua-caixinha"
            aria-label="Link da sua caixinha"
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCopyLink}
          >
            <CopyIcon />
            Copiar link
          </button>
        </div>
      </section>

      <div className="final-footer-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleCreateAnother}
        >
          <ImagesIcon />
          Criar outra arte
        </button>
      </div>

      {toast ? (
        <FlashMessage message={toast} onClose={() => setToast(null)} />
      ) : null}
    </main>
  );
}

export function FinalArtwork() {
  const { state, template } = useStudio();

  if (!template) {
    return (
      <main className="studio-page">
        <StudioHeader
          backHref="/estudio-de-artes"
          backLabel="Voltar aos modelos"
        />
        <div className="empty-state">
          <span className="empty-state-icon">
            <ImagesIcon />
          </span>
          <h1>Nenhuma arte para exportar</h1>
          <p>Escolha um modelo e personalize sua arte antes de continuar.</p>
          <Link href="/estudio-de-artes" className="btn btn-gold">
            Ver modelos
            <ArrowRightIcon />
          </Link>
        </div>
      </main>
    );
  }

  const theme = state.theme ?? template.colors;
  return (
    <FinalArtworkContent
      config={buildArtworkConfig(template, { ...state, theme })}
    />
  );
}
