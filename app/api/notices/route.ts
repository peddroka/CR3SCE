import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DismissedRow {
  notice_id: string;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notices: [] });
  }

  const { data: dismissed } = await supabase
    .from("notice_dismissals")
    .select("notice_id")
    .eq("user_id", user.id);

  const dismissedIds =
    ((dismissed ?? []) as DismissedRow[]).map((row) => row.notice_id) ?? [];

  let query = supabase
    .from("admin_notices")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (dismissedIds.length > 0) {
    query = query.not("id", "in", `(${dismissedIds.join(",")})`);
  }

  const { data: notices } = await query;

  return NextResponse.json({ notices: notices ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notice_id } = (await req.json()) as { notice_id: string };

  await supabase
    .from("notice_dismissals")
    .upsert({ user_id: user.id, notice_id });

  return NextResponse.json({ ok: true });
}
