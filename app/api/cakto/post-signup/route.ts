import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const bypassPaymentGate = process.env.BYPASS_PAYMENT_GATE === "true";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasValidServiceRoleKey =
  !!serviceRoleKey &&
  serviceRoleKey !== "sua_service_role_key_do_supabase";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }

    if (bypassPaymentGate) {
      return NextResponse.json({ status: "paid" }, { status: 200 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Se o ambiente ainda nao tem service role real, nao bloqueamos o fluxo.
    // O usuario segue para o checkout normalmente.
    if (!hasValidServiceRoleKey) {
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUserData.user) {
      console.error("Erro ao validar usuario no post-signup:", authUserError);
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    const authEmail = authUserData.user.email?.trim().toLowerCase();

    if (authEmail !== normalizedEmail) {
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    const { data: pending, error: pendingError } = await supabaseAdmin
      .from("pending_payments")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("processed", false)
      .maybeSingle();

    if (pendingError) {
      return NextResponse.json(
        { error: "Erro ao consultar pagamento pendente" },
        { status: 500 },
      );
    }

    if (!pending) {
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        payment_status: "paid",
        payment_confirmed_at: pending.confirmed_at,
        cakto_order_id: pending.cakto_order_id,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json(
        { error: "Erro ao atualizar profile" },
        { status: 500 },
      );
    }

    await supabaseAdmin
      .from("pending_payments")
      .update({ processed: true })
      .eq("email", normalizedEmail);

    return NextResponse.json({ status: "paid" }, { status: 200 });
  } catch (error) {
    console.error("Erro no post-signup:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
