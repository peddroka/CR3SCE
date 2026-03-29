import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 Webhook Cakto recebido:", JSON.stringify(body, null, 2));

    const eventName = body.event || body.custom_id || body?.data?.status;

    const isApproved =
      eventName === "purchase_approved" ||
      eventName === "order_approved" ||
      eventName === "approved" ||
      body?.data?.status === "approved" ||
      body?.status === "approved";

    if (!isApproved) {
      console.log("⏭️ Evento ignorado:", eventName);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const customerEmail =
      body?.data?.customer?.email ||
      body?.data?.buyer?.email ||
      body?.customer?.email ||
      body?.buyer?.email ||
      body?.email ||
      body?.data?.email;

    const orderId = body?.data?.id || body?.id || body?.order_id;

    if (!customerEmail) {
      console.error("❌ Email não encontrado no webhook:", body);
      return NextResponse.json(
        { error: "Email não encontrado" },
        { status: 400 },
      );
    }

    const email = customerEmail.toLowerCase().trim();
    console.log(`✅ Pagamento aprovado para: ${email}`);

    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Erro ao listar usuários:", listError);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }

    const user = users?.find((existingUser) => {
      return existingUser.email?.toLowerCase() === email;
    });

    if (!user) {
      console.log(
        `⏳ Usuário não encontrado, salvando pagamento pendente para: ${email}`,
      );

      await supabaseAdmin.from("pending_payments").upsert(
        {
          email,
          cakto_order_id: orderId || null,
          confirmed_at: new Date().toISOString(),
          processed: false,
        },
        { onConflict: "email" },
      );

      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { error: updateError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        payment_status: "paid",
        payment_confirmed_at: new Date().toISOString(),
        cakto_order_id: orderId || null,
      },
      { onConflict: "id" },
    );

    if (updateError) {
      console.error("❌ Erro ao atualizar profile:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar usuário" },
        { status: 500 },
      );
    }

    console.log(`🎉 Acesso liberado para: ${email}`);
    return NextResponse.json(
      { received: true, status: "paid" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
