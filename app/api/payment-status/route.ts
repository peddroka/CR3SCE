import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const bypassPaymentGate = process.env.BYPASS_PAYMENT_GATE === "true";
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { authenticated: false, status: "anonymous" },
        { status: 200 },
      );
    }

    if (bypassPaymentGate) {
      return NextResponse.json(
        { authenticated: true, status: "paid" },
        { status: 200 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("payment_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Erro ao consultar payment_status:", profileError);
      return NextResponse.json(
        { authenticated: true, status: "unconfigured" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        status: profile?.payment_status ?? "pending",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro interno ao consultar payment_status:", error);
    return NextResponse.json(
      { authenticated: true, status: "unconfigured" },
      { status: 200 },
    );
  }
}
