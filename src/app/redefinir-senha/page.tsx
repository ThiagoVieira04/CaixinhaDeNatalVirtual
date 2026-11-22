import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { GiftIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Redefinir senha | Caixinha Virtual",
};

export default async function ResetPasswordPage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

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

        <h1>Definir nova senha</h1>

        {!configured ? (
          <p className="form-success" role="status">
            Supabase não configurado neste ambiente. Preencha as variáveis do
            arquivo <code>.env.example</code> para habilitar a recuperação.
          </p>
        ) : user ? (
          <>
            <p className="auth-subtitle">
              Escolha uma nova senha para acessar sua conta.
            </p>
            <ResetPasswordForm />
          </>
        ) : (
          <>
            <p className="auth-subtitle">
              O link de recuperação é inválido ou expirou.
            </p>
            <Link href="/esqueci-senha" className="btn btn-gold btn-block">
              Solicitar novo link
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
