"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseAmountToCents } from "@/lib/format";
import { OTHER_BANK_CODE, findBank } from "@/lib/banks";
import type { CampaignStatus } from "@/lib/supabase/database.types";

export type CampaignFormState = {
  error?: string;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "caixinha"
  );
}

function normalizeStatus(value: string): CampaignStatus {
  if (
    value === "active" ||
    value === "paused" ||
    value === "closed" ||
    value === "draft"
  ) {
    return value;
  }
  return "draft";
}

function resolveBankName(bankCode: string, customName: string): string {
  if (bankCode === OTHER_BANK_CODE) {
    return customName || "Outro banco";
  }
  return findBank(bankCode)?.name ?? customName;
}

type CampaignInput = {
  title: string;
  description: string;
  goalCents: number;
  bankCode: string;
  bankName: string;
  pixKey: string;
  pixReceiverName: string;
  city: string;
  status: CampaignStatus;
};

function readCampaign(formData: FormData): CampaignInput | { error: string } {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const goalInput = text(formData, "goal");
  const bankCode = text(formData, "bank_code");
  const customBank = text(formData, "bank_name_custom");
  const pixKey = text(formData, "pix_key");
  const pixReceiverName = text(formData, "pix_receiver_name");
  const city = text(formData, "city");
  const status = normalizeStatus(text(formData, "status"));

  if (title.length < 3) {
    return { error: "Informe um título com pelo menos 3 caracteres." };
  }
  if (title.length > 80) {
    return { error: "O título deve ter no máximo 80 caracteres." };
  }

  const goalCents = goalInput ? parseAmountToCents(goalInput) : 0;
  if (goalCents === null) {
    return { error: "Informe uma meta válida, como 1.500,00." };
  }

  const bankName = resolveBankName(bankCode, customBank);

  if (status === "active") {
    if (!pixKey) {
      return { error: "Informe a chave PIX para publicar a caixinha." };
    }
    if (!city) {
      return { error: "Informe a cidade do recebedor do PIX." };
    }
    if (!bankName) {
      return { error: "Selecione o banco que recebe o PIX." };
    }
  }

  return {
    title,
    description,
    goalCents,
    bankCode,
    bankName,
    pixKey,
    pixReceiverName: pixReceiverName || title,
    city,
    status,
  };
}

async function uniqueSlug(base: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  let candidate = base;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    candidate = `${base}-${attempt + 2}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function createCampaignAction(
  _previousState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado neste ambiente." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  const input = readCampaign(formData);
  if ("error" in input) return { error: input.error };

  const supabase = await createSupabaseServerClient();

  // Garante que o perfil do comerciante existe para satisfazer a chave estrangeira
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) || "",
      business_name: (user.user_metadata?.business_name as string) || "",
    },
    { onConflict: "id" },
  );

  const slug = await uniqueSlug(slugify(input.title));

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      merchant_id: user.id,
      slug,
      title: input.title,
      description: input.description,
      goal_cents: input.goalCents,
      bank_code: input.bankCode,
      bank_name: input.bankName,
      pix_key: input.pixKey,
      pix_receiver_name: input.pixReceiverName,
      city: input.city,
      status: input.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Erro ao criar caixinha no Supabase:", error);
    return {
      error:
        error?.message ||
        "Não foi possível criar a caixinha. Verifique se todos os campos do PIX foram preenchidos.",
    };
  }

  revalidatePath("/");
  redirect(`/caixinhas/${data.id}`);
}

export async function updateCampaignAction(
  _previousState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado neste ambiente." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  const id = text(formData, "id");
  if (!id) return { error: "Caixinha inválida." };

  const input = readCampaign(formData);
  if ("error" in input) return { error: input.error };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .update({
      title: input.title,
      description: input.description,
      goal_cents: input.goalCents,
      bank_code: input.bankCode,
      bank_name: input.bankName,
      pix_key: input.pixKey,
      pix_receiver_name: input.pixReceiverName,
      city: input.city,
      status: input.status,
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error || !data) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/");
  revalidatePath(`/caixinhas/${id}`);
  revalidatePath(`/c/${data.slug}`);
  return { message: "Alterações salvas." };
}

export async function setCampaignStatusAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!id || !["draft", "active", "paused", "closed"].includes(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("campaigns")
    .update({ status: status as CampaignStatus })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  revalidatePath("/");
  revalidatePath(`/caixinhas/${id}`);
  if (data?.slug) revalidatePath(`/c/${data.slug}`);
}

export async function deleteCampaignAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const id = text(formData, "id");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("campaigns").delete().eq("id", id);

  revalidatePath("/");
  redirect("/");
}
