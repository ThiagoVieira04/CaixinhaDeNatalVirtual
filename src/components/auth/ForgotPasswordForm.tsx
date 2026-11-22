"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type AuthState,
} from "@/lib/auth/actions";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
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

      <button type="submit" className="btn btn-gold btn-block" disabled={isPending}>
        {isPending ? "Enviando…" : "Enviar link de recuperação"}
      </button>

      <p className="auth-switch">
        Lembrou a senha? <Link href="/entrar">Entrar</Link>
      </p>
    </form>
  );
}
