"use client";

import { useActionState, useState } from "react";
import {
  registerContributionAction,
  type ContributionFormState,
} from "@/lib/donations/actions";
import { WhatsAppIcon } from "@/components/icons";

const initialState: ContributionFormState = {};

export const QUICK_AMOUNTS = [
  { value: "2,00", label: "R$ 2,00" },
  { value: "5,00", label: "R$ 5,00" },
  { value: "10,00", label: "R$ 10,00" },
  { value: "20,00", label: "R$ 20,00" },
  { value: "50,00", label: "R$ 50,00" },
  { value: "100,00", label: "R$ 100,00" },
] as const;

export function ContributionForm({
  slug,
  amount: externalAmount,
  onAmountChange,
}: {
  slug: string;
  amount?: string;
  onAmountChange?: (value: string) => void;
}) {
  const [internalAmount, setInternalAmount] = useState("");
  const [state, formAction, isPending] = useActionState(
    registerContributionAction,
    initialState,
  );

  const isControlled = externalAmount !== undefined;
  const currentAmount = isControlled ? externalAmount : internalAmount;

  const handleAmountChange = (val: string) => {
    if (isControlled && onAmountChange) {
      onAmountChange(val);
    } else {
      setInternalAmount(val);
    }
  };

  const handleQuickSelect = (val: string) => {
    if (currentAmount === val) {
      handleAmountChange("");
    } else {
      handleAmountChange(val);
    }
  };

  if (state.message) {
    const shareText = encodeURIComponent(
      `Acabei de contribuir para a caixinha de Natal! 🎄✨ Contribua você também:\n${typeof window !== "undefined" ? window.location.href : ""}`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

    return (
      <div className="contribution-success-box" role="status">
        <div className="celebration-badge">🎉 🎁 ✨</div>
        <strong>Obrigado por apoiar!</strong>
        <p>{state.message}</p>

        <div className="contribution-success-actions">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-block"
          >
            <WhatsAppIcon />
            Compartilhar no WhatsApp
          </a>

          <button
            type="button"
            className="btn btn-outline btn-block btn-small"
            onClick={() => window.location.reload()}
          >
            Fazer outra contribuição
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="contribution-form">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="text"
        name="website"
        className="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="field">
        <label className="quick-amounts-label">Escolha um valor sugerido</label>
        <div className="quick-amounts-grid" role="group" aria-label="Valores rápidos de contribuição">
          {QUICK_AMOUNTS.map((item) => {
            const isActive = currentAmount === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={`quick-amount-btn ${isActive ? "active" : ""}`}
                onClick={() => handleQuickSelect(item.value)}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label htmlFor="amount">Valor da contribuição (R$)</label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          className="input"
          value={currentAmount}
          onChange={(event) => handleAmountChange(event.target.value)}
          placeholder="Ex: 2,00 ou 5,00"
          required
        />
        <span className="field-hint">
          Você pode clicar em um valor sugerido acima ou digitar qualquer valor.
        </span>
      </div>

      <div className="field">
        <label htmlFor="donor_name">Seu nome</label>
        <input
          id="donor_name"
          name="donor_name"
          type="text"
          className="input"
          maxLength={80}
          placeholder="Como você quer aparecer"
          autoComplete="name"
          required
          aria-required="true"
        />
        <span className="field-hint">
          Não é preciso criar conta. Basta informar seu nome.
        </span>
      </div>

      <div className="field">
        <label htmlFor="note">Mensagem (opcional)</label>
        <textarea
          id="note"
          name="note"
          className="input textarea"
          rows={2}
          maxLength={200}
          placeholder="Deixe uma mensagem de carinho para a equipe"
        />
      </div>

      <label className="checkbox-field">
        <input type="checkbox" name="confirmed_pix" required />
        <span>Já fiz o PIX para esta chave.</span>
      </label>

      {state.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-gold btn-block" disabled={isPending}>
        {isPending ? "Registrando…" : "Registrar minha contribuição"}
      </button>

      <p className="field-hint">
        A contribuição fica pendente até o organizador confirmar o recebimento.
      </p>
    </form>
  );
}
