import { createClient } from "@/lib/supabase/server";
import { OnboardingQuestionnaire } from "@/components/dashboard/onboarding-questionnaire";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Onboarding | Cresci.ai",
  description: "Configure seu negócio para começar a usar a Cresci.ai",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("ONBOARDING - User:", user?.id);

  if (!user) {
    redirect("/auth/login");
  }

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  console.log("ONBOARDING - Businesses:", businesses);
  console.log("ONBOARDING - Error:", error);

  const business = businesses?.[0] ?? null;

  if (business) {
    console.log("ONBOARDING - Tem business, redirecionando pro dashboard");
    redirect("/dashboard");
  }

  console.log("ONBOARDING - Sem business, mostrando questionário");

  return <OnboardingQuestionnaire />;
}
