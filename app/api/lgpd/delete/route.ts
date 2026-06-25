import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/lgpd/audit";

const GRACE_PERIOD_DAYS = 30;

function scheduledFor(): string {
  const date = new Date();
  date.setDate(date.getDate() + GRACE_PERIOD_DAYS);
  return date.toISOString();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let reason: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.reason === "string") {
      reason = body.reason.slice(0, 500);
    }
  } catch {
    // body opcional
  }

  // upsert para garantir idempotência caso o usuário clique duas vezes
  const { data, error } = await supabase
    .from("data_deletion_requests")
    .upsert(
      {
        user_id: user.id,
        reason,
        requested_at: new Date().toISOString(),
        scheduled_for: scheduledFor(),
        status: "pending",
        cancelled_at: null,
        completed_at: null,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[lgpd/delete] failed", error);
    return NextResponse.json(
      { error: "Falha ao registrar solicitação" },
      { status: 500 },
    );
  }

  await logAudit({
    supabase,
    userId: user.id,
    action: "account.delete_requested",
    metadata: { scheduledFor: data.scheduled_for, reason },
    request,
  });

  return NextResponse.json({
    ok: true,
    request: data,
    gracePeriodDays: GRACE_PERIOD_DAYS,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("data_deletion_requests")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    supabase,
    userId: user.id,
    action: "account.delete_cancelled",
    request,
  });

  return NextResponse.json({ ok: true, request: data });
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
    .from("data_deletion_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ request: data ?? null });
}
