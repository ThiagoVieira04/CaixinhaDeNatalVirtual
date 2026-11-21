"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { TrashIcon, UploadIcon } from "@/components/icons";
import {
  fileInputAccept,
  readFileAsDataUrl,
  validateImageFile,
} from "@/lib/studio/validation";

type ImageUploadFieldProps = {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  shape?: "square" | "circle";
  hint?: string;
  emptyLabel?: string;
};

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  shape = "square",
  hint = "PNG, JPG ou WEBP • até 2 MB",
  emptyLabel = "Enviar imagem",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setError(null);
    setIsReading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Não foi possível ler a imagem.",
      );
    } finally {
      setIsReading(false);
    }
  };

  return (
    <div className="upload-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`upload-row upload-${shape}`}>
        <div className={`upload-preview ${value ? "has-image" : ""}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} />
          ) : (
            <UploadIcon />
          )}
        </div>

        <div className="upload-controls">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={fileInputAccept()}
            className="sr-only"
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn btn-small btn-outline"
            onClick={() => inputRef.current?.click()}
            disabled={isReading}
          >
            {isReading ? "Carregando…" : value ? "Alterar" : emptyLabel}
          </button>
          {value ? (
            <button
              type="button"
              className="text-button text-danger"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
            >
              <TrashIcon />
              Remover
            </button>
          ) : null}
          <span className="field-hint">{hint}</span>
        </div>
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
