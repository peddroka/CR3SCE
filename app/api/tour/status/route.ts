import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ completed: false });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("tour_completed")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar tour_completed:", error.message);
      return NextResponse.json({ completed: false });
    }

    return NextResponse.json({
      completed: profile?.tour_completed === true,
    });
  } catch (err) {
    console.error("Erro no tour/status:", err);
    return NextResponse.json({ completed: false });
  }
}
