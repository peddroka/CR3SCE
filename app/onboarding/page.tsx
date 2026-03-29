import { createClient } from "@/lib/supabase/server";
import { OnboardingQuestionnaire } from "@/components/dashboard/onboarding-questionnaire";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Onboarding | CR3SCE",
  description: "Configure seu negócio para começar a usar a CR3SCE",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const business = businesses?.[0] ?? null;

  if (business) {
    redirect("/dashboard");
  }

  return <OnboardingQuestionnaire />;
}
