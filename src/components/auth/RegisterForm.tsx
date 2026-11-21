"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <div className="field">
        <label htmlFor="full_name">Seu nome</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className="input"
          autoComplete="name"
          maxLength={80}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="business_name">Nome do negócio</label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          className="input"
          maxLength={80}
          required
        />
      </div>

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
          autoComplete="new-password"
          minLength={6}
          required
        />
        <span className="field-hint">Mínimo de 6 caracteres.</span>
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
        {isPending ? "Criando conta…" : "Criar conta"}
      </button>

      <p className="auth-switch">
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </form>
  );
}
