import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScoreClient } from "@/components/dashboard/score-client";

export default async function ScorePage() {
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

  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const { data: analyses } = await supabase
    .from("profile_scores")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth)
    .order("created_at", { ascending: false });

  const analysisCount = analyses?.length || 0;
  const lastAnalysis = analyses?.[0] || null;

  return (
    <ScoreClient
      business={business}
      analysisCount={analysisCount}
      lastAnalysis={lastAnalysis}
    />
  );
}
