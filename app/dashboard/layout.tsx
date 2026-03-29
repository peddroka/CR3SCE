import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTip } from "@/components/dashboard/dashboard-tip";
import { NoticeModal } from "@/components/dashboard/notice-modal";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { SupportButton } from "@/components/dashboard/support-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-background via-background to-white/5">
      <DashboardSidebar />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 overflow-y-auto overflow-x-hidden min-h-screen">
        <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
      <SupportButton />
      <DashboardTip />
      <OnboardingTour />
      <NoticeModal />
    </div>
  );
}
