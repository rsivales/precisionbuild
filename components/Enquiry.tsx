"use client";
import { useState } from "react";
import Script from "next/script";
export default function Enquiry() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const enabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        try {
          const fd = new FormData(form);
          const response = await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(fd)),
          });
          const result = await response.json();
          setMessage(result.message);
          if (response.ok) form.reset();
        } catch {
          setMessage("Não foi possível enviar. Tente novamente.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Nome
        <input name="name" required maxLength={120} />
      </label>
      <label>
        Email
        <input name="email" type="email" required maxLength={254} />
      </label>
      <label>
        Telefone
        <input name="phone" type="tel" maxLength={30} />
      </label>
      <label>
        Tipo de projeto
        <select name="service">
          <option>LSF</option>
          <option>Reabilitação</option>
          <option>Renovação</option>
        </select>
      </label>
      <label>
        O seu projeto
        <textarea name="message" required maxLength={4000} rows={4} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="check">
        <input type="checkbox" required />
        Autorizo o contacto para análise deste pedido. Os dados serão utilizados
        apenas para esse fim.
      </label>
      {enabled && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </>
      )}
      <button disabled={busy || !enabled}>
        {busy ? "A enviar…" : "Enviar pedido"}
      </button>
      {!enabled && (
        <p className="muted">
          O formulário está a ser preparado. Os pedidos ainda não são enviados.
        </p>
      )}
      <p role="status">{message}</p>
    </form>
  );
}
