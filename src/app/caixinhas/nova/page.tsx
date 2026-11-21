import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { StudioHeader } from "@/components/StudioHeader";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getCurrentUser, getProfile } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Nova caixinha | Caixinha Virtual",
};

export default async function NewCampaignPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/entrar?next=/caixinhas/nova");
  }

  const profile = await getProfile(user.id);

  return (
    <div className="app-shell">
      <Sidebar active="caixinhas" />

      <main className="dashboard-main">
        <StudioHeader
          backHref="/"
          backLabel="Voltar ao painel"
          rightSlot={
            <Link href="/" className="text-link">
              <ArrowLeftIcon />
              Painel
            </Link>
          }
        />

        <h1 className="studio-title">Criar nova caixinha</h1>
        <p className="page-subtitle">
          Preencha os dados da campanha e informe a chave PIX que vai receber as
          contribuições.
        </p>

        <section className="panel form-panel">
          <CampaignForm
            mode="create"
            defaultReceiverName={profile?.business_name ?? ""}
          />
        </section>
      </main>
    </div>
  );
}
