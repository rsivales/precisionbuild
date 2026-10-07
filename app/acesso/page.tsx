"use client";
import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import { supabase } from "@/lib/supabase";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="login">
      <Brand />
      <div className="login-card">
        <div className="eyebrow">PRECISION BUILDING</div>
        <h1>Bem-vindo à sua obra.</h1>
        <p>Acesso de clientes e equipa.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase) return;
            setBusy(true);
            setError("");
            const fd = new FormData(e.currentTarget);
            try {
              const { error } = await supabase.auth.signInWithPassword({
                email: String(fd.get("email")),
                password: String(fd.get("password")),
              });
              if (error) throw error;
              window.location.assign("/portal");
            } catch {
              setError(
                "Não foi possível entrar. Verifique os dados de acesso.",
              );
              setBusy(false);
            }
          }}
        >
          <label>
            Email
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Palavra-passe
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button disabled={!supabase || busy}>
            {busy ? "A entrar…" : "Entrar"}
          </button>
          {!supabase && (
            <p className="notice">
              O acesso real ficará disponível quando a nova base de dados
              estiver ligada.
            </p>
          )}
          <p role="alert">{error}</p>
        </form>
        <Link className="text-link" href="/demonstracao">
          Explorar demonstração com dados fictícios
        </Link>
      </div>
      <Link href="/">Voltar ao website</Link>
    </main>
  );
}
