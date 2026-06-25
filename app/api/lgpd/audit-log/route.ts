import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit, type AuditAction } from "@/lib/lgpd/audit";

// Ações que o cliente está autorizado a registrar. Restringe para evitar
// que o cliente forje qualquer string.
const CLIENT_ALLOWED_ACTIONS: AuditAction[] = [
  "auth.login",
  "auth.logout",
  "profile.update",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { action?: string; entityType?: string; entityId?: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.action || !CLIENT_ALLOWED_ACTIONS.includes(body.action as AuditAction)) {
    return NextResponse.json({ error: "Ação não permitida" }, { status: 400 });
  }

  await logAudit({
    supabase,
    userId: user.id,
    action: body.action as AuditAction,
    entityType: body.entityType,
    entityId: body.entityId,
    metadata: body.metadata,
    request,
  });

  return NextResponse.json({ ok: true });
}
