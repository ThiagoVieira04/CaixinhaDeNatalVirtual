"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="next" value={next} />

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="form-success" role="status">
          {state.message}
        </p>
      ) : null}

      <p className="auth-switch">
        <Link href="/esqueci-senha">Esqueci minha senha</Link>
      </p>

      <button type="submit" className="btn btn-gold btn-block" disabled={isPending}>
        {isPending ? "Entrando…" : "Entrar"}
      </button>

      <p className="auth-switch">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta">Criar conta</Link>
      </p>
    </form>
  );
}
