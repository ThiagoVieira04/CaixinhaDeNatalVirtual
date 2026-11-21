import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { StudioFooter } from "@/components/StudioFooter";
import { HeroGift } from "@/components/HeroGift";
import {
  ArrowRightIcon,
  ChartIcon,
  GiftIcon,
  ImagesIcon,
  PaletteIcon,
  PlusIcon,
  UserIcon,
} from "@/components/icons";
import { getCurrentUser, getProfile, profileDisplayName } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import type {
  CampaignSummaryRow,
  CampaignStatus,
} from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Painel | Caixinha Virtual",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  closed: "Encerrada",
};

function progressPercent(total: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((total / goal) * 100));
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="app-shell">
        <Sidebar active="inicio" />
        <main className="dashboard-main">
          <section className="setup-card">
            <span className="empty-state-icon">
              <GiftIcon />
            </span>
            <h1>Configure o Supabase para começar</h1>
            <p>
              Copie o arquivo <code>.env.example</code> para <code>.env.local</code>,
              preencha a URL e a chave anônima do Supabase e rode as migrations em{" "}
              <code>supabase/migrations</code>.
            </p>
            <p>
              Enquanto isso, você pode conhecer o Estúdio de Artes.
            </p>
            <Link href="/estudio-de-artes" className="btn btn-gold">
              Abrir Estúdio de Artes
              <ArrowRightIcon />
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar");
  }

  const [profile, campaigns] = await Promise.all([
    getProfile(user.id),
    (async () => {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("campaign_summaries")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as CampaignSummaryRow[];
    })(),
  ]);

  const displayName = profileDisplayName(profile, user);
  const totals = campaigns.reduce(
    (accumulator, campaign) => {
      accumulator.raised += campaign.total_cents;
      accumulator.donations += campaign.donation_count;
      accumulator.pending += campaign.pending_count;
      accumulator.goal += campaign.goal_cents;
      return accumulator;
    },
    { raised: 0, donations: 0, pending: 0, goal: 0 },
  );

  const stats = [
    { label: "Arrecadado", value: formatBRL(totals.raised) },
    { label: "Contribuições", value: String(totals.donations) },
    { label: "Pendentes", value: String(totals.pending) },
    { label: "Meta total", value: formatBRL(totals.goal) },
  ];

  return (
    <div className="app-shell">
      <Sidebar active="inicio" />

      <main className="dashboard-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <UserIcon />
              Olá, {displayName}!
            </span>
            <h1>Vamos preparar sua campanha de Natal?</h1>
            <p>
              Crie sua caixinha, receba contribuições via PIX e divulgue com uma
              arte personalizada.
            </p>
          </div>
          <HeroGift />
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        <section className="dashboard-cta">
          <span className="dashboard-cta-icon">
            <PlusIcon />
          </span>
          <p>Crie uma nova caixinha e comece a receber contribuições.</p>
          <Link href="/caixinhas/nova" className="btn btn-gold">
            Nova caixinha
            <ArrowRightIcon />
          </Link>
        </section>

        <section className="campaigns-section">
          <div className="section-head">
            <h2>Minhas caixinhas</h2>
            <span className="badge-soft">{campaigns.length} cadastrada(s)</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="empty-state empty-state-inline">
              <span className="empty-state-icon">
                <GiftIcon />
              </span>
              <h3>Você ainda não criou uma caixinha</h3>
              <p>
                Cadastre sua campanha, informe sua chave PIX e compartilhe o link
                com seus clientes.
              </p>
              <Link href="/caixinhas/nova" className="btn btn-gold">
                Criar minha primeira caixinha
                <ArrowRightIcon />
              </Link>
            </div>
          ) : (
            <div className="campaign-list">
              {campaigns.map((campaign) => {
                const percent = progressPercent(
                  campaign.total_cents,
                  campaign.goal_cents,
                );
                return (
                  <article key={campaign.id} className="campaign-card">
                    <div className="campaign-card-head">
                      <div>
                        <h3>{campaign.title}</h3>
                        <span className={`status-pill status-${campaign.status}`}>
                          {STATUS_LABEL[campaign.status]}
                        </span>
                      </div>
                      <strong>{formatBRL(campaign.total_cents)}</strong>
                    </div>

                    <div className="progress-track" aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </div>

                    <div className="campaign-meta">
                      <span>
                        {campaign.donation_count} contribuição(ões)
                      </span>
                      {campaign.goal_cents > 0 ? (
                        <span>Meta: {formatBRL(campaign.goal_cents)}</span>
                      ) : null}
                      {campaign.pending_count > 0 ? (
                        <span className="pending-pill">
                          {campaign.pending_count} pendente(s)
                        </span>
                      ) : null}
                    </div>

                    <div className="campaign-actions">
                      <Link
                        href={`/caixinhas/${campaign.id}`}
                        className="btn btn-small btn-outline"
                      >
                        <ChartIcon />
                        Gerenciar
                      </Link>
                      <Link
                        href={`/c/${campaign.slug}`}
                        className="text-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver página pública
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="studio-promo">
          <span className="material-icon">
            <PaletteIcon />
          </span>
          <div>
            <strong>Crie sua arte de divulgação</strong>
            <p>
              Personalize uma imagem com o nome do seu negócio e compartilhe no
              WhatsApp Status.
            </p>
          </div>
          <Link href="/estudio-de-artes" className="btn btn-gold">
            <ImagesIcon />
            Abrir Estúdio de Artes
          </Link>
        </section>

        <StudioFooter />
      </main>
    </div>
  );
}
