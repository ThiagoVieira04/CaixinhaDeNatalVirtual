"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { ArrowRightIcon, ImagesIcon } from "@/components/icons";
import { StudioHeader } from "@/components/StudioHeader";
import {
  ACCENT_OPTIONS,
  COLOR_PALETTES,
  accentOptionFor,
} from "@/lib/studio/templates";
import { buildArtworkConfig, useStudio } from "./StudioProvider";
import { ImageUploadField } from "./ImageUploadField";
import { ArtCanvas } from "./ArtCanvas";

export function EditorWorkspace() {
  const router = useRouter();
  const previewRef = useRef<HTMLElement>(null);
  const { state, template, update, applyTheme, resetColors } = useStudio();

  if (!template) {
    return (
      <main className="studio-page">
        <StudioHeader backHref="/estudio-de-artes" backLabel="Voltar aos modelos" />
        <div className="empty-state">
          <span className="empty-state-icon">
            <ImagesIcon />
          </span>
          <h1>Escolha um modelo primeiro</h1>
          <p>
            Para personalizar sua arte, selecione um dos seis modelos
            disponíveis na galeria.
          </p>
          <Link href="/estudio-de-artes" className="btn btn-gold">
            Ver modelos
            <ArrowRightIcon />
          </Link>
        </div>
      </main>
    );
  }

  const theme = state.theme ?? template.colors;
  const accentOption = accentOptionFor(theme.accent);
  const config = buildArtworkConfig(template, { ...state, theme });

  return (
    <main className="studio-page studio-page-wide">
      <StudioHeader
        backHref="/estudio-de-artes"
        backLabel="Voltar aos modelos"
        rightSlot={<span className="badge-soft">{template.name}</span>}
      />

      <h1 className="studio-title">Personalize sua arte</h1>

      <div className="editor-grid">
        <section className="panel editor-controls">
          <h2 className="panel-title">Personalização</h2>

          <ImageUploadField
            id="logo-upload"
            label="Sua Logo"
            value={state.logo}
            onChange={(logo) => update({ logo })}
            hint="PNG, JPG ou WEBP • até 2 MB"
            emptyLabel="Enviar logo"
          />

          <div className="field">
            <label htmlFor="business-name">Nome da Empresa</label>
            <input
              id="business-name"
              className="input"
              type="text"
              value={state.businessName}
              maxLength={40}
              placeholder="Sua Empresa"
              onChange={(event) =>
                update({ businessName: event.target.value })
              }
            />
          </div>

          <div className="field">
            <label htmlFor="message">Mensagem Principal</label>
            <textarea
              id="message"
              className="input textarea"
              value={state.message}
              maxLength={100}
              rows={2}
              placeholder="Neste Natal, sua contribuição faz a diferença!"
              onChange={(event) => update({ message: event.target.value })}
            />
            <span
              className={`field-counter ${
                state.message.length > 90 ? "is-warn" : ""
              }`}
            >
              {state.message.length}/100
            </span>
          </div>

          <div className="field">
            <label htmlFor="secondary">Mensagem Secundária</label>
            <textarea
              id="secondary"
              className="input textarea"
              value={state.secondary}
              maxLength={100}
              rows={2}
              placeholder="Juntos por um Natal melhor"
              onChange={(event) => update({ secondary: event.target.value })}
            />
            <span className="field-counter">
              {state.secondary.length}/100
            </span>
          </div>

          <div className="field">
            <label htmlFor="cta">Chamada principal (botão)</label>
            <input
              id="cta"
              className="input"
              type="text"
              value={state.cta}
              maxLength={40}
              placeholder="Contribua via PIX"
              onChange={(event) => update({ cta: event.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="accent-color">Cor Principal</label>
            <div className="color-select">
              <span
                className="color-dot"
                style={{ backgroundColor: theme.accent }}
                aria-hidden="true"
              />
              <select
                id="accent-color"
                value={accentOption.key}
                onChange={(event) => {
                  const option = ACCENT_OPTIONS.find(
                    (item) => item.key === event.target.value,
                  );
                  if (option) {
                    applyTheme({
                      accent: option.accent,
                      accentText: option.accentText,
                    });
                  }
                }}
              >
                {ACCENT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="palette-block">
              <span className="field-hint">Combinações sugeridas</span>
              <div className="palette-row">
                {COLOR_PALETTES.map((palette) => {
                  const isActive =
                    theme.accent === palette.accent &&
                    theme.headline === palette.headline;
                  return (
                    <button
                      key={palette.key}
                      type="button"
                      className={`palette-chip ${isActive ? "is-active" : ""}`}
                      title={palette.label}
                      aria-label={`Aplicar combinação ${palette.label}`}
                      aria-pressed={isActive}
                      style={{
                        background: `linear-gradient(135deg, ${palette.preview[0]} 0 50%, ${palette.preview[1]} 50% 100%)`,
                      }}
                      onClick={() =>
                        applyTheme({
                          headline: palette.headline,
                          accent: palette.accent,
                          accentText: palette.accentText,
                        })
                      }
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={resetColors}
            >
              Restaurar cores originais
            </button>
          </div>

          {template.layout.hasPhoto ? (
            <ImageUploadField
              id="photo-upload"
              label="Foto da Equipe (opcional)"
              value={state.photo}
              onChange={(photo) => update({ photo })}
              shape="circle"
              hint="Enviada apenas para esta arte, no seu navegador."
              emptyLabel="Enviar foto"
            />
          ) : (
            <p className="field-hint">
              Este modelo não possui área para foto da equipe.
            </p>
          )}

          <div className="editor-footer-actions">
            <Link href="/estudio-de-artes" className="btn btn-outline">
              Voltar
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                previewRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              Visualizar arte
            </button>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => router.push("/estudio-de-artes/pronto")}
            >
              Gerar Minha Arte
              <ArrowRightIcon />
            </button>
          </div>
        </section>

        <section ref={previewRef} className="panel preview-panel">
          <div className="preview-head">
            <span>Prévia da arte</span>
            <span className="preview-size">1080 × 1920 px</span>
          </div>
          <ArtCanvas config={config} />
          <p className="preview-note">
            A prévia acompanha suas alterações em tempo real.
          </p>
        </section>
      </div>
    </main>
  );
}
