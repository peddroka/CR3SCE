"use client";

import dynamic from "next/dynamic";

const StrategyCalendar = dynamic(
  () =>
    import("@/components/dashboard/strategy-calendar").then((module) => ({
      default: module.StrategyCalendar,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C8F135]" />
      </div>
    ),
  },
);

export function StrategyCalendarDynamic({
  strategy,
  businessCreatedAt,
  businessNiche,
  businessObjective,
  businessTone,
}: {
  strategy: any;
  businessCreatedAt?: string | null;
  businessNiche?: string | null;
  businessObjective?: string | null;
  businessTone?: string | null;
}) {
  return (
    <StrategyCalendar
      strategy={strategy}
      businessCreatedAt={businessCreatedAt}
      businessNiche={businessNiche}
      businessObjective={businessObjective}
      businessTone={businessTone}
    />
  );
}
