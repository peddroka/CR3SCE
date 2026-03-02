import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Pega usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Pega perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Pega business do usuário
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Se não tiver business, redireciona para onboarding
  if (!business) {
    redirect("/onboarding");
  }

  // Pega a estratégia mais recente COM os dias
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*, strategy_days(*)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestStrategy = strategies?.[0] ?? null;

  return (
    <DashboardHome
      profile={profile}
      business={business}
      latestStrategy={latestStrategy}
    />
  );
}
