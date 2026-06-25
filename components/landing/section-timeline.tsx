"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

/**
 * Indicador de progresso vertical, discreto, no canto direito.
 * Mostra em qual seção o usuário está e quantas faltam.
 * Também ativa o scroll-snap (escopado à landing) enquanto montado.
 */
export function SectionTimeline({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(0);

  // Ativa o scroll-snap apenas enquanto a landing está montada
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("landing-snap");
    return () => root.classList.remove("landing-snap");
  }, []);

  // Detecta a seção ativa pelo cruzamento do centro da viewport
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const progress =
    sections.length > 1 ? active / (sections.length - 1) : 0;

  return (
    <nav
      aria-label="Progresso das seções"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="group relative flex flex-col items-center gap-4 py-2">
        {/* trilho */}
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/50" />
        {/* preenchimento de progresso */}
        <span
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-lime/40 transition-[height] duration-500 ease-out"
          style={{ height: `${progress * 100}%` }}
        />

        {sections.map((s, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              aria-label={s.label}
              aria-current={isActive ? "true" : undefined}
              className="relative flex items-center justify-center"
            >
              <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {s.label}
              </span>
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  isActive
                    ? "size-2.5 bg-lime"
                    : isPast
                      ? "size-1.5 bg-lime/40"
                      : "size-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/50",
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
