import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { GiftIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Recuperar senha | Caixinha Virtual",
};

export default function ForgotPasswordPage() {
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

        <h1>Recuperar senha</h1>
        <p className="auth-subtitle">
          Informe seu e-mail para receber um link de redefinição de senha.
        </p>

        {isSupabaseConfigured() ? (
          <ForgotPasswordForm />
        ) : (
          <p className="form-success" role="status">
            Supabase não configurado neste ambiente. Preencha as variáveis do
            arquivo <code>.env.example</code> para habilitar a recuperação.
          </p>
        )}
      </section>
    </main>
  );
}
