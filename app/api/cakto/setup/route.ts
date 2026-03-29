import { NextResponse } from "next/server";

export async function POST() {
  try {
    const tokenRes = await fetch("https://api.cakto.com.br/public_api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CAKTO_CLIENT_ID!,
        client_secret: process.env.CAKTO_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Falha na autenticação", detail: tokenData },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const webhookRes = await fetch(
      "https://api.cakto.com.br/public_api/webhook/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "CR3SCE - Compra Aprovada",
          url: `${appUrl}/api/cakto/webhook`,
          products: [process.env.CAKTO_PRODUCT_ID],
          events: ["purchase_approved"],
          status: "active",
        }),
      },
    );

    const webhookData = await webhookRes.json();

    return NextResponse.json({
      success: true,
      webhook_id: webhookData.id,
      webhook_secret: webhookData.fields?.secret,
      instrucao:
        "Salve o webhook_secret no .env.local como CAKTO_WEBHOOK_SECRET e no NEXT_PUBLIC_APP_URL coloque seu domínio real",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
