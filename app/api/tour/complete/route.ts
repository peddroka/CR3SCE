import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ tour_completed: true })
      .eq("id", user.id);

    if (error) {
      console.error("Erro ao marcar tour completo:", error.message);
      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no tour/complete:", err);
    return NextResponse.json({ ok: false });
  }
}
