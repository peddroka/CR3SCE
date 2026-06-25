"use client";

import { AnimateOnScroll } from "@/components/ui/animate";

const stats = [
  { num: "47+", label: "Empreendedores ativos" },
  { num: "30", label: "Dias de conteúdo por mês" },
  { num: "3x", label: "Mais engajamento médio" },
];

export function StatsBar() {
  return (
    <div className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3">
        {stats.map((stat, i) => (
          <AnimateOnScroll
            key={i}
            delay={i * 100}
            className="border-r border-border px-10 py-14 text-center transition-colors last:border-r-0 hover:bg-secondary"
          >
            <p className="mb-2 font-bebas text-[clamp(40px,5vw,64px)] leading-none text-lime">
              {stat.num}
            </p>
            <p className="text-xs tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </AnimateOnScroll>
        ))}
      </div>
    </div>
  );
}
