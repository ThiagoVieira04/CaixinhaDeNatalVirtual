"use client";

import { useEffect, useState } from "react";
import { PixCard } from "./PixCard";
import { ContributionForm } from "./ContributionForm";
import { buildPixPayload } from "@/lib/pix/brcode";
import { pixQrDataUrl } from "@/lib/pix/qrcode";
import { parseAmountToCents, formatBRL } from "@/lib/format";

export function PublicContributeSection({
  slug,
  campaignTitle,
  pixKey,
  pixReceiverName,
  city,
  initialPixPayload,
  initialQrDataUrl,
}: {
  slug: string;
  campaignTitle: string;
  pixKey: string;
  pixReceiverName: string;
  city: string;
  initialPixPayload: string;
  initialQrDataUrl: string;
}) {
  const [amount, setAmount] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>(initialPixPayload);
  const [qrDataUrl, setQrDataUrl] = useState<string>(initialQrDataUrl);
  const [amountText, setAmountText] = useState<string | undefined>(undefined);

  useEffect(() => {
    const cents = parseAmountToCents(amount);

    if (cents && cents > 0) {
      const formatted = formatBRL(cents);
      setAmountText(formatted);

      const dynamicPayload = buildPixPayload({
        key: pixKey,
        receiverName: pixReceiverName || campaignTitle,
        city,
        amountCents: cents,
      });

      setPixCode(dynamicPayload);

      pixQrDataUrl(dynamicPayload)
        .then((url) => setQrDataUrl(url))
        .catch(() => {
          // Mantém o QR Code anterior se houver falha
        });
    } else {
      setAmountText(undefined);
      setPixCode(initialPixPayload);
      setQrDataUrl(initialQrDataUrl);
    }
  }, [amount, pixKey, pixReceiverName, campaignTitle, city, initialPixPayload, initialQrDataUrl]);

  return (
    <div className="public-grid">
      <section className="public-card">
        <h2>Como contribuir</h2>
        <PixCard
          code={pixCode}
          qrDataUrl={qrDataUrl}
          receiverName={pixReceiverName || campaignTitle}
          city={city}
          amountText={amountText}
        />
        <p className="field-hint">
          {amountText
            ? `O PIX acima está configurado para o valor exato de ${amountText}.`
            : "Escolha um valor ao lado para gerar o PIX já com o valor preenchido."}
        </p>
      </section>

      <section className="public-card">
        <h2>Registrar contribuição</h2>
        <p className="field-hint">
          Sem cadastro: preencha seu nome e o valor da contribuição.
        </p>
        <ContributionForm
          slug={slug}
          amount={amount}
          onAmountChange={setAmount}
        />
      </section>
    </div>
  );
}
