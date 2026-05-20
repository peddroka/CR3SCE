// Helper para registrar trilha de auditoria de acoes sensiveis.
// Insercoes silenciosas (nao quebram a request principal se falharem).

import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "auth.signup"
  | "auth.login"
  | "auth.logout"
  | "profile.update"
  | "consent.granted"
  | "consent.revoked"
  | "data.export"
  | "account.delete_requested"
  | "account.delete_cancelled"
  | "payment.confirmed"
  | "admin.action";

export type LogAuditInput = {
  supabase: SupabaseClient;
  userId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  request?: Request;
};

export function extractRequestMeta(request: Request | undefined) {
  if (!request) return { ip: null, userAgent: null };

  const userAgent = request.headers.get("user-agent");
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  // X-Forwarded-For pode ter varios IPs separados por virgula — o primeiro
  // e o do cliente original.
  const ip = forwarded?.split(",")[0]?.trim() || realIp || null;

  return { ip, userAgent };
}

export async function logAudit({
  supabase,
  userId,
  action,
  entityType,
  entityId,
  metadata,
  request,
}: LogAuditInput) {
  const { ip, userAgent } = extractRequestMeta(request);

  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
      ip_address: ip,
      user_agent: userAgent,
    });
    if (error) {
      console.warn("[audit] falha ao inserir log:", action, error.message);
    }
  } catch (err) {
    console.warn("[audit] excecao ao inserir log:", action, err);
  }
}
