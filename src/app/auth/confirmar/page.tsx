"use client";

/**
 * Página intermediária para processar tokens de autenticação via hash fragment.
 *
 * O Supabase envia links de recuperação de senha / confirmação de email no formato:
 *   https://seu-site.com/auth/callback#access_token=...&type=recovery
 *
 * Como o hash (#) não é enviado ao servidor, precisamos de uma página client-side
 * para capturar e processar esses tokens antes de redirecionar o usuário.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GiftIcon } from "@/components/icons";
import Link from "next/link";

export default function ConfirmarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processando" | "erro">("processando");
  const [mensagem, setMensagem] = useState("Verificando link…");

  useEffect(() => {
    async function processarToken() {
      // Lê o hash da URL (ex: #access_token=...&type=recovery)
      const hash = window.location.hash.substring(1);
      if (!hash) {
        // Sem hash — pode ser redirect direto sem token
        const next = searchParams.get("next") ?? "/";
        router.replace(next);
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        setStatus("erro");
        setMensagem(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
        return;
      }

      if (!accessToken || !refreshToken) {
        // Sem tokens — redireciona para o destino ou home
        const next = searchParams.get("next") ?? "/";
        router.replace(next);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setStatus("erro");
          setMensagem("Link inválido ou expirado. Solicite um novo link.");
          return;
        }

        // Redireciona conforme o tipo de autenticação
        if (type === "recovery") {
          router.replace("/redefinir-senha");
        } else if (type === "signup" || type === "email_change") {
          router.replace("/?bem_vindo=1");
        } else {
          const next = searchParams.get("next") ?? "/";
          router.replace(next);
        }
      } catch {
        setStatus("erro");
        setMensagem("Ocorreu um erro ao processar o link. Tente novamente.");
      }
    }

    processarToken();
  }, [router, searchParams]);

  return (
    <main className="auth-page">
      <section className="auth-card" style={{ textAlign: "center" }}>
        <Link href="/" className="auth-brand">
          <span className="brand-mark">
            <GiftIcon />
          </span>
          <span className="brand-name">
            Caixinha<strong>Virtual</strong>
          </span>
        </Link>

        {status === "processando" ? (
          <>
            <div
              style={{
                fontSize: "2.5rem",
                margin: "1.5rem 0 1rem",
                animation: "spin 1.5s linear infinite",
              }}
            >
              🎄
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              {mensagem}
            </h1>
            <p className="auth-subtitle">Aguarde um momento…</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "2.5rem", margin: "1.5rem 0 1rem" }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Link inválido
            </h1>
            <p className="auth-subtitle">{mensagem}</p>
            <Link href="/esqueci-senha" className="btn btn-gold btn-block" style={{ marginTop: "1rem" }}>
              Solicitar novo link
            </Link>
          </>
        )}
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
