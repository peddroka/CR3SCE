import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/lgpd/audit";

// Lista das tabelas que armazenam dados pessoais ou conteudo do usuario.
// Sao consultadas com RLS (o usuario logado so ve as proprias linhas).
const USER_DATA_TABLES = [
  "profiles",
  "businesses",
  "strategies",
  "strategy_days",
  "evolution_data",
  "image_generations",
  "profile_scores",
  "consents",
  "audit_logs",
  "data_deletion_requests",
] as const;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      metadata: user.user_metadata ?? null,
    },
    data: {},
  };

  const dataBlock = payload.data as Record<string, unknown>;

  for (const table of USER_DATA_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(table === "profiles" ? "id" : "user_id", user.id);

    if (error) {
      // Tabela pode nao existir ainda — registramos e seguimos.
      dataBlock[table] = { error: error.message };
      continue;
    }

    dataBlock[table] = data ?? [];
  }

  await logAudit({
    supabase,
    userId: user.id,
    action: "data.export",
    request,
  });

  const filename = `cr3sce-meus-dados-${user.id}-${Date.now()}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
