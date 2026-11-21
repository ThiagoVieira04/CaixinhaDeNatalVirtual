import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { GiftIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Entrar | Caixinha Virtual",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const requested = params.next ?? "/";
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">
            <GiftIcon />
          </span>
          <span className="brand-name">
            Caixinha
            <strong>Virtual</strong>
          </span>
        </Link>

        <h1>Bem-vindo de volta</h1>
        <p className="auth-subtitle">
          Entre para gerenciar sua caixinha e acompanhar as contribuições.
        </p>

        {isSupabaseConfigured() ? (
          <LoginForm next={next} />
        ) : (
          <p className="form-success" role="status">
            Supabase não configurado neste ambiente. Preencha as variáveis do
            arquivo <code>.env.example</code> para habilitar o acesso.
          </p>
        )}
      </section>
    </main>
  );
}
