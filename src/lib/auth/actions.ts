"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl, isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = {
  error?: string;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function safeNext(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }
  if (normalized.includes("already registered")) {
    return "Já existe uma conta com este e-mail.";
  }
  if (normalized.includes("password")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (normalized.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (normalized.includes("email")) {
    return "Confira o e-mail informado.";
  }

  return "Não foi possível concluir. Tente novamente.";
}

export async function signInAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado neste ambiente." };
  }

  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(text(formData, "next") || "/");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect(next);
}

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado neste ambiente." };
  }

  const fullName = text(formData, "full_name");
  const businessName = text(formData, "business_name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !businessName) {
    return { error: "Informe seu nome e o nome do seu negócio." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const origin = (await headers()).get("origin") ?? getAppUrl();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    message:
      "Conta criada! Confirme seu e-mail pelo link enviado para ativar o acesso.",
  };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/entrar");
}
