"use client";

import { Instagram } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate";

export function InstagramBanner() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-8">
      <AnimateOnScroll className="relative flex flex-col items-center justify-between gap-8 overflow-hidden border border-border bg-card p-8 md:flex-row md:p-12">
        <div
          className="absolute left-0 right-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(to right, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
          }}
        />
        <div>
          <h3 className="mb-2 font-bebas text-3xl">
            SIGA A GENTE NO INSTAGRAM
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Dicas diárias de conteúdo e cases de clientes. Tudo que você precisa
            pra nunca mais ficar sem saber o que postar.{" "}
            <strong className="text-foreground">@cr3sce</strong>
          </p>
        </div>
        <a
          href="https://instagram.com/cr3sce"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-3 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(220,39,67,0.3)]"
          style={{
            background:
              "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
          }}
        >
          <Instagram className="size-5" />
          @cr3sce no Instagram
        </a>
      </AnimateOnScroll>
    </div>
  );
}
