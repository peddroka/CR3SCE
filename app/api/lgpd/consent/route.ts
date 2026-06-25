import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractRequestMeta, logAudit } from "@/lib/lgpd/audit";
import {
  COOKIES_POLICY_VERSION,
  PRIVACY_POLICY_VERSION,
  TERMS_OF_USE_VERSION,
} from "@/lib/lgpd/company";

const CONSENT_TYPES = [
  "terms_of_use",
  "privacy_policy",
  "cookies_analytics",
  "cookies_marketing",
  "marketing_emails",
  "ai_processing",
] as const;

type ConsentType = (typeof CONSENT_TYPES)[number];

function versionFor(type: ConsentType) {
  switch (type) {
    case "terms_of_use":
      return TERMS_OF_USE_VERSION;
    case "privacy_policy":
      return PRIVACY_POLICY_VERSION;
    case "cookies_analytics":
    case "cookies_marketing":
      return COOKIES_POLICY_VERSION;
    default:
      return "1.0.0";
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { entries?: { type: ConsentType; granted: boolean }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (entries.length === 0) {
    return NextResponse.json(
      { error: "Nenhum consentimento informado" },
      { status: 400 },
    );
  }

  const { ip, userAgent } = extractRequestMeta(request);

  const rows = entries
    .filter((e) => CONSENT_TYPES.includes(e.type))
    .map((e) => ({
      user_id: user.id,
      type: e.type,
      version: versionFor(e.type),
      granted: e.granted === true,
      granted_at: new Date().toISOString(),
      revoked_at: e.granted === true ? null : new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    }));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Tipos de consentimento inválidos" },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("consents").insert(rows);

  if (insertError) {
    console.error("[lgpd/consent] insert failed", insertError);
    return NextResponse.json(
      { error: "Falha ao registrar consentimentos" },
      { status: 500 },
    );
  }

  // Sincroniza opt-in de marketing no profile (espelho da última decisão)
  const marketingEntry = entries.find((e) => e.type === "marketing_emails");
  if (marketingEntry) {
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          marketing_emails_opt_in: marketingEntry.granted === true,
          marketing_emails_consent_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
  }

  for (const entry of entries) {
    await logAudit({
      supabase,
      userId: user.id,
      action: entry.granted ? "consent.granted" : "consent.revoked",
      entityType: "consent",
      entityId: entry.type,
      metadata: { version: versionFor(entry.type) },
      request,
    });
  }

  return NextResponse.json({ ok: true, recorded: rows.length });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("consents")
    .select("type, version, granted, granted_at, revoked_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Agrega o estado corrente por tipo (última entrada vence)
  const current: Record<string, boolean> = {};
  for (const row of data ?? []) {
    if (!(row.type in current)) {
      current[row.type] = row.granted;
    }
  }

  return NextResponse.json({ current, history: data ?? [] });
}
