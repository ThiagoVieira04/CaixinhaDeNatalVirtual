"use client";

import { useState } from "react";
import { addManualDonationAction } from "@/lib/donations/actions";
import { QUICK_AMOUNTS } from "./ContributionForm";
import { todayISODate } from "@/lib/format";
import { PlusIcon } from "@/components/icons";

export function ManualDonationForm({ campaignId }: { campaignId: string }) {
  const [amount, setAmount] = useState("");

  const handleQuickSelect = (val: string) => {
    setAmount(amount === val ? "" : val);
  };

  return (
    <form action={addManualDonationAction} className="manual-form">
      <input type="hidden" name="campaign_id" value={campaignId} />

      <div className="field">
        <label className="quick-amounts-label">Valores rápidos</label>
        <div className="quick-amounts-grid" role="group" aria-label="Valores rápidos">
          {QUICK_AMOUNTS.map((item) => {
            const isActive = amount === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={`quick-amount-btn ${isActive ? "active" : ""}`}
                onClick={() => handleQuickSelect(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="manual-amount">Valor (R$)</label>
          <input
            id="manual-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 5,00 ou 20,00"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="manual-name">Nome do contribuinte</label>
          <input
            id="manual-name"
            name="donor_name"
            type="text"
            className="input"
            maxLength={80}
            placeholder="Opcional (ex: Cliente balcão)"
          />
        </div>

        <div className="field">
          <label htmlFor="manual-date">Data</label>
          <input
            id="manual-date"
            name="donated_at"
            type="date"
            className="input"
            defaultValue={todayISODate()}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="manual-note">Mensagem ou observação</label>
        <input
          id="manual-note"
          name="note"
          type="text"
          className="input"
          maxLength={200}
          placeholder="Opcional"
        />
      </div>

      <button type="submit" className="btn btn-gold">
        <PlusIcon />
        Adicionar contribuição
      </button>
    </form>
  );
}
