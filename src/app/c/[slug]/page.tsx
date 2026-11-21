import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftIcon, ArrowRightIcon } from "@/components/icons";
import { PublicContributeSection } from "@/components/campaign/PublicContributeSection";
import { buildPixPayload } from "@/lib/pix/brcode";
import { pixQrDataUrl } from "@/lib/pix/qrcode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatBRL, formatDateBR } from "@/lib/format";
import type {
  CampaignRow,
  PublicCampaignTotalRow,
  PublicContributionRow,
} from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Caixinha de Natal | Caixinha Virtual",
};

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="public-page">
        <div className="public-card">
          <h1>Caixinha indisponível</h1>
          <p>Esta página ainda não está configurada neste ambiente.</p>
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: campaignData } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!campaignData) {
    notFound();
  }

  const campaign = campaignData as CampaignRow;

  const [{ data: totalsData }, { data: contributionsData }] = await Promise.all([
    supabase
      .from("public_campaign_totals")
      .select("*")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("public_campaign_contributions")
      .select("*")
      .eq("slug", slug)
      .order("confirmed_at", { ascending: false })
      .limit(12),
  ]);

  const totals = totalsData as PublicCampaignTotalRow | null;
  const contributions = (contributionsData ?? []) as PublicContributionRow[];
  const raised = totals?.total_cents ?? 0;
  const donationCount = totals?.donation_count ?? 0;
  const percent =
    campaign.goal_cents > 0
      ? Math.min(100, Math.round((raised / campaign.goal_cents) * 100))
      : 0;

  const pixPayload = buildPixPayload({
    key: campaign.pix_key,
    receiverName: campaign.pix_receiver_name || campaign.title,
    city: campaign.city,
  });
  const qrDataUrl = await pixQrDataUrl(pixPayload);

  return (
    <main className="public-page">
      <header className="public-header">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <GiftIcon />
          </span>
          <span className="brand-name">
            Caixinha
            <strong>Virtual</strong>
          </span>
        </Link>
        <Link href="/criar-conta" className="btn btn-small btn-outline">
          Criar minha caixinha
          <ArrowRightIcon />
        </Link>
      </header>

      <section className="public-hero">
        <span className="status-pill status-active">Caixinha ativa</span>
        <h1>{campaign.title}</h1>
        {campaign.description ? <p>{campaign.description}</p> : null}

        <div className="public-stats">
          <div>
            <span>Arrecadado</span>
            <strong>{formatBRL(raised)}</strong>
          </div>
          <div>
            <span>Contribuições</span>
            <strong>{donationCount}</strong>
          </div>
          {campaign.goal_cents > 0 ? (
            <div>
              <span>Meta</span>
              <strong>{formatBRL(campaign.goal_cents)}</strong>
            </div>
          ) : null}
        </div>

        {campaign.goal_cents > 0 ? (
          <>
            <div className="progress-track progress-track-lg" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </div>
            <span className="field-hint">{percent}% da meta alcançada</span>
          </>
        ) : null}
      </section>

      <PublicContributeSection
        slug={campaign.slug}
        campaignTitle={campaign.title}
        pixKey={campaign.pix_key}
        pixReceiverName={campaign.pix_receiver_name || campaign.title}
        city={campaign.city}
        initialPixPayload={pixPayload}
        initialQrDataUrl={qrDataUrl}
      />

      <section className="public-card">
        <div className="section-head">
          <h2>Contribuições confirmadas</h2>
          <span className="badge-soft">{donationCount}</span>
        </div>

        {contributions.length === 0 ? (
          <p className="field-hint">
            Seja a primeira pessoa a contribuir com esta caixinha!
          </p>
        ) : (
          <ul className="public-contribution-list">
            {contributions.map((contribution, index) => (
              <li key={`${contribution.confirmed_at}-${index}`}>
                <div>
                  <strong>{contribution.donor_name || "Anônimo"}</strong>
                  {contribution.note ? <p>{contribution.note}</p> : null}
                  <small>{formatDateBR(contribution.confirmed_at)}</small>
                </div>
                <span>{formatBRL(contribution.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="public-footer">
        <span>Caixinha Virtual • Natal Solidário</span>
        <Link href="/criar-conta">Quero criar a minha caixinha</Link>
      </footer>
    </main>
  );
}
