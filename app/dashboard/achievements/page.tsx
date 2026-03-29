import { redirect } from "next/navigation";
import { AchievementsClient } from "@/components/dashboard/achievements-client";
import { createClient } from "@/lib/supabase/server";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: strategies } = await supabase
    .from("strategies")
    .select("id, month, year, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const strategyIds = (strategies ?? []).map((strategy) => strategy.id);
  const { data: strategyDays } = strategyIds.length
    ? await supabase
        .from("strategy_days")
        .select("id, day_number, posts, strategy_id")
        .in("strategy_id", strategyIds)
    : { data: [] as Array<{ id: string; day_number: number; posts: unknown; strategy_id: string }> };

  const totalCompleted = (strategyDays ?? []).reduce((acc, day) => {
    const posts = (day.posts as any[]) ?? [];
    return acc + posts.filter((post) => post.completed).length;
  }, 0);

  const totalPosts = (strategyDays ?? []).reduce((acc, day) => {
    const posts = (day.posts as any[]) ?? [];
    return acc + posts.length;
  }, 0);

  const monthsActive = (strategies ?? []).length;

  return (
    <AchievementsClient
      business={business}
      strategies={strategies ?? []}
      totalCompleted={totalCompleted}
      totalPosts={totalPosts}
      monthsActive={monthsActive}
    />
  );
}
