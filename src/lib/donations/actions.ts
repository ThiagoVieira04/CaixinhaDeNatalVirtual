"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseAmountToCents, todayISODate } from "@/lib/format";

export type ContributionFormState = {
  error?: string;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function registerContributionAction(
  _previousState: ContributionFormState,
  formData: FormData,
): Promise<ContributionFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "Contribuições indisponíveis neste ambiente." };
  }

  if (text(formData, "website")) {
    return { error: "Não foi possível registrar a contribuição." };
  }

  const slug = text(formData, "slug");
  const amountCents = parseAmountToCents(text(formData, "amount"));
  const donorName = text(formData, "donor_name").slice(0, 80);
  const note = text(formData, "note").slice(0, 200);
  const confirmedPix = formData.get("confirmed_pix");

  if (!slug) {
    return { error: "Caixinha inválida." };
  }
  if (amountCents === null) {
    return { error: "Informe um valor válido, como 25,00." };
  }
  if (!confirmedPix) {
    return { error: "Confirme que você já fez o PIX antes de registrar." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("register_contribution", {
    p_slug: slug,
    p_amount_cents: amountCents,
    p_donor_name: donorName,
    p_note: note,
  });

  if (error) {
    return {
      error:
        error.message ||
        "Não foi possível registrar a contribuição. Tente novamente.",
    };
  }

  revalidatePath(`/c/${slug}`);
  return {
    message:
      "Contribuição registrada! Ela aparecerá após a confirmação do organizador.",
  };
}

export async function addManualDonationAction(
  formData: FormData,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const campaignId = text(formData, "campaign_id");
  const amountCents = parseAmountToCents(text(formData, "amount"));
  const donorName = text(formData, "donor_name").slice(0, 80);
  const note = text(formData, "note").slice(0, 200);
  const donatedAt = text(formData, "donated_at") || todayISODate();

  if (!campaignId || amountCents === null) return;

  const supabase = await createSupabaseServerClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign) return;

  await supabase.from("donations").insert({
    campaign_id: campaign.id,
    merchant_id: user.id,
    amount_cents: amountCents,
    donor_name: donorName || null,
    note: note || null,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
    donated_at: donatedAt,
  });

  revalidatePath(`/caixinhas/${campaign.id}`);
  revalidatePath("/");
  revalidatePath(`/c/${campaign.slug}`);
}

export async function confirmDonationAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const id = text(formData, "id");
  const campaignId = text(formData, "campaign_id");
  if (!id || !campaignId) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("donations")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .select("campaign_id")
    .maybeSingle();

  if (!data) return;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("slug")
    .eq("id", campaignId)
    .maybeSingle();

  revalidatePath(`/caixinhas/${campaignId}`);
  revalidatePath("/");
  if (campaign?.slug) revalidatePath(`/c/${campaign.slug}`);
}

export async function rejectDonationAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const id = text(formData, "id");
  const campaignId = text(formData, "campaign_id");
  if (!id || !campaignId) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("donations")
    .update({ status: "rejected", confirmed_at: null })
    .eq("id", id);

  revalidatePath(`/caixinhas/${campaignId}`);
  revalidatePath("/");
}

export async function deleteDonationAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const id = text(formData, "id");
  const campaignId = text(formData, "campaign_id");
  if (!id || !campaignId) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("donations").delete().eq("id", id);

  revalidatePath(`/caixinhas/${campaignId}`);
  revalidatePath("/");
}
