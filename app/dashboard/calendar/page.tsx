import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StrategyCalendarDynamic } from "@/components/dashboard/strategy-calendar-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Pega usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Pega business do usuário
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  // Pega a estratégia mais recente COM os dias (especificando os campos)
  const { data: strategies } = await supabase
    .from("strategies")
    .select(
      `
      *,
      strategy_days (
        id,
        day_number,
        posts,
        completed
      )
    `,
    )
    .eq("business_id", business.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestStrategy = strategies?.[0] ?? null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <StrategyCalendarDynamic
        strategy={latestStrategy}
        businessCreatedAt={business.created_at ?? null}
        businessNiche={business.niche ?? null}
        businessObjective={business.main_goal ?? null}
        businessTone={business.communication_style ?? null}
      />
    </div>
  );
}
