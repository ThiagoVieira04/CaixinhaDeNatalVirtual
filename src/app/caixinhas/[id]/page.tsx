import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { StudioHeader } from "@/components/StudioHeader";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { CopyLinkButton } from "@/components/campaign/CopyLinkButton";
import { ArrowRightIcon, CheckIcon, TrashIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured, publicCampaignUrl } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBRL, formatDateBR, todayISODate } from "@/lib/format";
import {
  addManualDonationAction,
  confirmDonationAction,
  deleteDonationAction,
  rejectDonationAction,
} from "@/lib/donations/actions";
import {
  deleteCampaignAction,
  setCampaignStatusAction,
} from "@/lib/campaigns/actions";
import type {
  CampaignRow,
  CampaignStatus,
  DonationRow,
} from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Gerenciar caixinha | Caixinha Virtual",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  closed: "Encerrada",
};

export default async function ManageCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) {
    redirect(`/entrar?next=/caixinhas/${id}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: campaignData } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!campaignData) {
    notFound();
  }

  const campaign = campaignData as CampaignRow;

  const { data: donationsData } = await supabase
    .from("donations")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  const donations = (donationsData ?? []) as DonationRow[];
  const pending = donations.filter((item) => item.status === "pending");
  const confirmed = donations.filter((item) => item.status === "confirmed");
  const rejected = donations.filter((item) => item.status === "rejected");

  const raised = confirmed.reduce(
    (total, item) => total + item.amount_cents,
    0,
  );
  const percent =
    campaign.goal_cents > 0
      ? Math.min(100, Math.round((raised / campaign.goal_cents) * 100))
      : 0;

  const publicUrl = publicCampaignUrl(campaign.slug);

  return (
    <div className="app-shell">
      <Sidebar active="caixinhas" />

      <main className="dashboard-main">
        <StudioHeader
          backHref="/"
          backLabel="Voltar ao painel"
          rightSlot={
            <span className={`status-pill status-${campaign.status}`}>
              {STATUS_LABEL[campaign.status]}
            </span>
          }
        />

        <div className="manage-head">
          <div>
            <h1 className="studio-title">{campaign.title}</h1>
            <p className="page-subtitle">
              {campaign.description || "Sem descrição cadastrada."}
            </p>
          </div>
          <div className="manage-head-actions">
            <CopyLinkButton url={publicUrl} />
            <Link
              href={`/c/${campaign.slug}`}
              className="btn btn-small btn-gold"
              target="_blank"
              rel="noreferrer"
            >
              Ver página pública
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Arrecadado</span>
            <strong>{formatBRL(raised)}</strong>
          </div>
          <div className="stat-card">
            <span>Meta</span>
            <strong>
              {campaign.goal_cents > 0 ? formatBRL(campaign.goal_cents) : "—"}
            </strong>
          </div>
          <div className="stat-card">
            <span>Confirmadas</span>
            <strong>{confirmed.length}</strong>
          </div>
          <div className="stat-card">
            <span>Pendentes</span>
            <strong>{pending.length}</strong>
          </div>
        </section>

        {campaign.goal_cents > 0 ? (
          <div className="progress-track progress-track-lg" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
        ) : null}

        <section className="panel manage-panel">
          <div className="section-head">
            <h2>Contribuições pendentes</h2>
            <span className="badge-soft">{pending.length}</span>
          </div>

          {pending.length === 0 ? (
            <p className="field-hint">
              Nenhuma contribuição aguardando confirmação.
            </p>
          ) : (
            <div className="donation-list">
              {pending.map((donation) => (
                <article key={donation.id} className="donation-item">
                  <div className="donation-info">
                    <strong>{donation.donor_name || "Anônimo"}</strong>
                    <span>{formatBRL(donation.amount_cents)}</span>
                    {donation.note ? <p>{donation.note}</p> : null}
                    <small>{formatDateBR(donation.donated_at)}</small>
                  </div>
                  <div className="donation-actions">
                    <form action={confirmDonationAction}>
                      <input type="hidden" name="id" value={donation.id} />
                      <input
                        type="hidden"
                        name="campaign_id"
                        value={campaign.id}
                      />
                      <button
                        type="submit"
                        className="btn btn-small btn-gold"
                      >
                        <CheckIcon />
                        Confirmar
                      </button>
                    </form>
                    <form action={rejectDonationAction}>
                      <input type="hidden" name="id" value={donation.id} />
                      <input
                        type="hidden"
                        name="campaign_id"
                        value={campaign.id}
                      />
                      <button
                        type="submit"
                        className="btn btn-small btn-outline"
                      >
                        Recusar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel manage-panel">
          <div className="section-head">
            <h2>Registrar contribuição manualmente</h2>
          </div>
          <p className="field-hint">
            Use quando você receber o PIX e quiser confirmar a contribuição
            diretamente.
          </p>

          <form action={addManualDonationAction} className="manual-form">
            <input type="hidden" name="campaign_id" value={campaign.id} />
            <div className="form-row">
              <div className="field">
                <label htmlFor="manual-amount">Valor (R$)</label>
                <input
                  id="manual-amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  className="input"
                  placeholder="50,00"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="manual-name">Nome</label>
                <input
                  id="manual-name"
                  name="donor_name"
                  type="text"
                  className="input"
                  maxLength={80}
                  placeholder="Opcional"
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
              <label htmlFor="manual-note">Mensagem</label>
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
              Registrar contribuição
            </button>
          </form>
        </section>

        <section className="panel manage-panel">
          <div className="section-head">
            <h2>Contribuições confirmadas</h2>
            <span className="badge-soft">{confirmed.length}</span>
          </div>

          {confirmed.length === 0 ? (
            <p className="field-hint">Ainda não há contribuições confirmadas.</p>
          ) : (
            <div className="donation-list">
              {confirmed.map((donation) => (
                <article key={donation.id} className="donation-item">
                  <div className="donation-info">
                    <strong>{donation.donor_name || "Anônimo"}</strong>
                    <span>{formatBRL(donation.amount_cents)}</span>
                    {donation.note ? <p>{donation.note}</p> : null}
                    <small>{formatDateBR(donation.donated_at)}</small>
                  </div>
                  <form action={deleteDonationAction}>
                    <input type="hidden" name="id" value={donation.id} />
                    <input type="hidden" name="campaign_id" value={campaign.id} />
                    <button
                      type="submit"
                      className="text-button text-danger"
                      aria-label="Excluir contribuição"
                    >
                      <TrashIcon />
                      Excluir
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}

          {rejected.length > 0 ? (
            <p className="field-hint">{rejected.length} contribuição(ões) recusada(s).</p>
          ) : null}
        </section>

        <section className="panel manage-panel">
          <div className="section-head">
            <h2>Situação da caixinha</h2>
          </div>
          <div className="status-actions">
            {(["draft", "active", "paused", "closed"] as CampaignStatus[]).map(
              (status) => (
                <form key={status} action={setCampaignStatusAction}>
                  <input type="hidden" name="id" value={campaign.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    type="submit"
                    className={`btn btn-small ${
                      campaign.status === status ? "btn-gold" : "btn-outline"
                    }`}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                </form>
              ),
            )}
          </div>
        </section>

        <details className="panel manage-panel">
          <summary className="section-head">
            <h2>Editar caixinha</h2>
            <span className="text-link">Abrir formulário</span>
          </summary>
          <div className="edit-form-wrap">
            <CampaignForm mode="edit" campaign={campaign} />
          </div>
        </details>

        <details className="panel manage-panel danger-zone">
          <summary className="section-head">
            <h2>Zona de risco</h2>
            <span className="text-link">Excluir caixinha</span>
          </summary>
          <p className="field-hint">
            A exclusão remove a caixinha e todas as contribuições registradas. Não
            pode ser desfeita.
          </p>
          <form action={deleteCampaignAction}>
            <input type="hidden" name="id" value={campaign.id} />
            <button type="submit" className="btn btn-small btn-outline text-danger">
              <TrashIcon />
              Excluir definitivamente
            </button>
          </form>
        </details>
      </main>
    </div>
  );
}
