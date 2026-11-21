import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GiftIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Criar conta | Caixinha Virtual",
};

export default function RegisterPage() {
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

        <h1>Crie sua caixinha</h1>
        <p className="auth-subtitle">
          Cadastre seu negócio, publique sua campanha e receba contribuições via
          PIX.
        </p>

        {isSupabaseConfigured() ? (
          <RegisterForm />
        ) : (
          <p className="form-success" role="status">
            Supabase não configurado neste ambiente. Preencha as variáveis do
            arquivo <code>.env.example</code> para habilitar o cadastro.
          </p>
        )}
      </section>
    </main>
  );
}
