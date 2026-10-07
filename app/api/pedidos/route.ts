import { createClient } from "@supabase/supabase-js";
export async function POST(request: Request) {
  const reply = (message: string, status: number) =>
    Response.json({ message }, { status });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SECRET_KEY,
    secret = process.env.TURNSTILE_SECRET_KEY,
    organization = process.env.PRECISION_ORGANIZATION_ID;
  if (!url || !key || !secret || !organization)
    return reply("Receção de pedidos ainda não configurada.", 503);
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 20000)
      return reply("Pedido demasiado extenso.", 413);
    const raw = await request.text();
    if (raw.length > 20000) return reply("Pedido demasiado extenso.", 413);
    const body = JSON.parse(raw);
    if (body.website) return reply("Pedido inválido.", 400);
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 120 ||
      typeof body.email !== "string" ||
      body.email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(body.email) ||
      typeof body.message !== "string" ||
      !body.message.trim() ||
      body.message.length > 4000 ||
      !["LSF", "Reabilitação", "Renovação"].includes(body.service) ||
      typeof body["cf-turnstile-response"] !== "string"
    )
      return reply("Verifique os campos e a validação de segurança.", 400);
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret,
          response: body["cf-turnstile-response"],
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    const result = await verification.json();
    if (!result.success) return reply("Repita a validação de segurança.", 400);
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await db
      .from("leads")
      .insert({
        organization_id: organization,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: typeof body.phone === "string" ? body.phone.slice(0, 30) : "",
        service: body.service,
        message: body.message.trim(),
      });
    if (error)
      return reply("Não foi possível guardar o pedido. Tente novamente.", 500);
    return reply("Pedido recebido. A nossa equipa entrará em contacto.", 201);
  } catch {
    return reply("Não foi possível processar o pedido.", 400);
  }
}
