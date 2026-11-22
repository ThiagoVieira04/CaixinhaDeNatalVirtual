import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const type = url.searchParams.get("type");

  // Fluxo PKCE (confirmação de email, magic link)
  if (isSupabaseConfigured() && code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && type === "recovery") {
      // Após trocar o code, redireciona para a página de redefinição de senha
      return NextResponse.redirect(new URL("/redefinir-senha", url.origin));
    }

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // Fluxo implicit (token no hash — tratado no cliente via /auth/confirmar)
  // O Supabase envia: /auth/callback#access_token=...&type=recovery
  // Redirecionamos para a página client-side que processa o hash
  if (!code) {
    const target = next !== "/" ? next : "/";
    return NextResponse.redirect(new URL(`/auth/confirmar?next=${encodeURIComponent(target)}`, url.origin));
  }

  return NextResponse.redirect(new URL("/entrar?erro=link_invalido", url.origin));
}
