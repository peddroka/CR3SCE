import { redirect } from "next/navigation";
import { TrendsClient } from "@/components/dashboard/trends-client";
import { createClient } from "@/lib/supabase/server";

export default async function TrendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("niche, platforms, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return <TrendsClient business={business} />;
}
