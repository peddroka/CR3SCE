import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const { data: strategies } = await supabase
    .from("strategies")
    .select("*, strategy_days(*)")
    .eq("business_id", business.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestStrategy = strategies?.[0] ?? null;

  return (
    <DashboardHome
      profile={profile}
      business={business}
      latestStrategy={latestStrategy}
      userId={user.id}
    />
  );
}
