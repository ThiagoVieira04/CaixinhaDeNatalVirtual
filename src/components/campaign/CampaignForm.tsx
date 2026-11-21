"use client";

import { useActionState, useState } from "react";
import {
  createCampaignAction,
  updateCampaignAction,
  type CampaignFormState,
} from "@/lib/campaigns/actions";
import { BANKS, OTHER_BANK_CODE } from "@/lib/banks";
import type { CampaignRow, CampaignStatus } from "@/lib/supabase/database.types";

const initialState: CampaignFormState = {};

const STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: "draft", label: "Rascunho (não aparece no link público)" },
  { value: "active", label: "Ativa (recebendo contribuições)" },
  { value: "paused", label: "Pausada" },
  { value: "closed", label: "Encerrada" },
];

function goalToInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function CampaignForm({
  mode,
  campaign,
  defaultReceiverName = "",
}: {
  mode: "create" | "edit";
  campaign?: CampaignRow;
  defaultReceiverName?: string;
}) {
  const action = mode === "create" ? createCampaignAction : updateCampaignAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [bankCode, setBankCode] = useState(campaign?.bank_code ?? "");
  const [status, setStatus] = useState<CampaignStatus>(
    campaign?.status ?? "active",
  );

  return (
    <form action={formAction} className="campaign-form">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <div className="field">
        <label htmlFor="title">Título da caixinha</label>
        <input
          id="title"
          name="title"
          type="text"
          className="input"
          maxLength={80}
          defaultValue={campaign?.title ?? ""}
          placeholder="Natal Solidário da Padaria Pão Quente"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          className="input textarea"
          rows={3}
          maxLength={400}
          defaultValue={campaign?.description ?? ""}
          placeholder="Conte para que serve a sua caixinha e quem será ajudado."
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="goal">Meta (R$)</label>
          <input
            id="goal"
            name="goal"
            type="text"
            inputMode="decimal"
            className="input"
            defaultValue={goalToInput(campaign?.goal_cents ?? 0)}
            placeholder="1.500,00"
          />
          <span className="field-hint">Opcional. Deixe vazio para não exibir meta.</span>
        </div>

        <div className="field">
          <label htmlFor="status">Situação</label>
          <select
            id="status"
            name="status"
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value as CampaignStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="form-section">
        <legend>Recebimento via PIX</legend>

        <div className="field">
          <label htmlFor="pix_key">Chave PIX</label>
          <input
            id="pix_key"
            name="pix_key"
            type="text"
            className="input"
            maxLength={120}
            defaultValue={campaign?.pix_key ?? ""}
            placeholder="e-mail, telefone, CPF/CNPJ ou chave aleatória"
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="pix_receiver_name">Nome do recebedor</label>
            <input
              id="pix_receiver_name"
              name="pix_receiver_name"
              type="text"
              className="input"
              maxLength={25}
              defaultValue={
                campaign?.pix_receiver_name ?? defaultReceiverName
              }
              placeholder="Aparece no comprovante do PIX"
            />
          </div>

          <div className="field">
            <label htmlFor="city">Cidade do recebedor</label>
            <input
              id="city"
              name="city"
              type="text"
              className="input"
              maxLength={15}
              defaultValue={campaign?.city ?? ""}
              placeholder="Sua cidade"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="bank_code">Banco</label>
            <select
              id="bank_code"
              name="bank_code"
              className="input"
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
            >
              <option value="">Selecione</option>
              {BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {bankCode === OTHER_BANK_CODE ? (
            <div className="field">
              <label htmlFor="bank_name_custom">Nome do banco</label>
              <input
                id="bank_name_custom"
                name="bank_name_custom"
                type="text"
                className="input"
                maxLength={60}
                defaultValue={campaign?.bank_name ?? ""}
                placeholder="Informe o banco"
              />
            </div>
          ) : null}
        </div>
      </fieldset>

      {state.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="form-success" role="status">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn btn-gold" disabled={isPending}>
        {isPending
          ? "Salvando…"
          : mode === "create"
            ? "Criar caixinha"
            : "Salvar alterações"}
      </button>
    </form>
  );
}
