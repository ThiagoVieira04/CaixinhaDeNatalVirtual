"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <div className="field">
        <label htmlFor="password">Nova senha</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <span className="field-hint">Mínimo de 6 caracteres.</span>
      </div>

      <div className="field">
        <label htmlFor="password_confirmation">Confirmar nova senha</label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      {state.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-gold btn-block" disabled={isPending}>
        {isPending ? "Salvando…" : "Salvar nova senha"}
      </button>

      <p className="auth-switch">
        <Link href="/esqueci-senha">Solicitar outro link</Link>
      </p>
    </form>
  );
}
