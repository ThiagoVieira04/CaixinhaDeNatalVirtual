"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckIcon, ArrowRightIcon } from "@/components/icons";
import {
  PROVISIONAL_TEMPLATE_ASSETS,
  PROVISIONAL_TEMPLATE_NOTICE,
  TEMPLATES,
} from "@/lib/studio/templates";
import { useStudio } from "./StudioProvider";
import { StudioHeader } from "@/components/StudioHeader";

export function TemplateGallery() {
  const { state, selectTemplate } = useStudio();
  const router = useRouter();
  const selected = state.templateKey;
  const [unavailable, setUnavailable] = useState<string[]>([]);

  const markUnavailable = (key: string) => {
    setUnavailable((current) =>
      current.includes(key) ? current : [...current, key],
    );
  };

  const canContinue = Boolean(selected) && !unavailable.includes(selected ?? "");

  const handleContinue = () => {
    if (!canContinue) return;
    router.push("/estudio-de-artes/editor");
  };

  return (
    <main className="studio-page">
      <StudioHeader
        backHref="/"
        backLabel="Voltar ao início"
        rightSlot={
          <span className="badge-soft">6 modelos disponíveis</span>
        }
      />

      <h1 className="studio-title">Escolha um modelo para começar:</h1>

      {PROVISIONAL_TEMPLATE_ASSETS ? (
        <p className="provisional-note">{PROVISIONAL_TEMPLATE_NOTICE}</p>
      ) : null}

      <div className="template-grid">
        {TEMPLATES.map((template) => {
          const isSelected = selected === template.key;
          const isUnavailable = unavailable.includes(template.key);
          return (
            <button
              type="button"
              key={template.key}
              className={`template-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => selectTemplate(template.key)}
              aria-pressed={isSelected}
              aria-label={
                isUnavailable
                  ? `Modelo ${template.name} indisponível`
                  : `Selecionar modelo ${template.name}`
              }
              disabled={isUnavailable}
            >
              <span className="template-thumb">
                <Image
                  src={template.image}
                  alt={`Prévia do modelo ${template.name}`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
                  className="template-thumb-image"
                  onError={() => markUnavailable(template.key)}
                />
                {isUnavailable ? (
                  <span className="template-unavailable-tag">
                    Modelo indisponível
                  </span>
                ) : isSelected ? (
                  <span className="template-selected-tag">Selecionado</span>
                ) : null}
              </span>
              <span className="template-card-body">
                <span className="template-card-text">
                  <strong>{template.name}</strong>
                  <small>{template.tagline}</small>
                </span>
                <span
                  className={`radio ${isSelected ? "is-checked" : ""}`}
                  aria-hidden="true"
                >
                  {isSelected ? <CheckIcon /> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="studio-actions-row">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => router.push("/")}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-gold"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continuar
          <ArrowRightIcon />
        </button>
      </div>
    </main>
  );
}
