"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

export function PixCard({
  code,
  qrDataUrl,
  receiverName,
  city,
  amountText,
}: {
  code: string;
  qrDataUrl: string;
  receiverName: string;
  city: string;
  amountText?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="pix-card">
      <div className="pix-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code para pagamento via PIX" />
      </div>

      <div className="pix-info">
        <div className="pix-info-header">
          <strong>Pague com PIX</strong>
          {amountText ? (
            <span className="pix-amount-badge">
              Valor: <strong>{amountText}</strong>
            </span>
          ) : null}
        </div>
        <p>
          Aponte a câmera do seu banco para o QR Code ou copie o código abaixo.
        </p>
        <span className="field-hint">
          Recebedor: {receiverName} • {city}
        </span>

        <textarea
          className="input pix-code"
          value={code}
          readOnly
          rows={3}
          aria-label="Código PIX copia e cola"
          onFocus={(event) => event.target.select()}
        />

        <button type="button" className="btn btn-outline btn-block" onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied
            ? "Código copiado!"
            : amountText
              ? `Copiar PIX de ${amountText}`
              : "Copiar código PIX"}
        </button>
      </div>
    </div>
  );
}
