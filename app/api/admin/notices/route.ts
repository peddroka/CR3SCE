import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data: notices } = await supabase
    .from("admin_notices")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ notices: notices ?? [] });
}

export async function POST(req: Request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    title: string;
    description: string;
    link_url?: string;
    link_label?: string;
    notice_type?: string;
    promo_code?: string;
  };
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("admin_notices")
    .insert({
      title: body.title,
      description: body.description,
      link_url: body.link_url || null,
      link_label: body.link_label || null,
      notice_type: body.notice_type || "aviso",
      promo_code: body.promo_code || null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notice: data });
}
