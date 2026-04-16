"use client";

import dynamic from "next/dynamic";

const DashboardTip = dynamic(
  () => import("@/components/dashboard/dashboard-tip").then((m) => ({ default: m.DashboardTip })),
  { ssr: false },
);
const NoticeModal = dynamic(
  () => import("@/components/dashboard/notice-modal").then((m) => ({ default: m.NoticeModal })),
  { ssr: false },
);
const OnboardingTour = dynamic(
  () => import("@/components/dashboard/onboarding-tour").then((m) => ({ default: m.OnboardingTour })),
  { ssr: false },
);
const SupportButton = dynamic(
  () => import("@/components/dashboard/support-button").then((m) => ({ default: m.SupportButton })),
  { ssr: false },
);

export function DashboardExtras() {
  return (
    <>
      <SupportButton />
      <DashboardTip />
      <OnboardingTour />
      <NoticeModal />
    </>
  );
}
