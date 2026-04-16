"use client";

import Link from "next/link";
import { AnimateOnLoad } from "@/components/ui/animate";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-24 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,241,53,0.07)_0%,transparent_65%)]" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-bebas text-[clamp(120px,25vw,320px)] leading-none text-foreground/[0.02]"
        aria-hidden
      >
        CR3SCE
      </div>

      <AnimateOnLoad delay={100} className="relative z-10 mb-10 flex items-center gap-2 rounded-full border border-[rgba(200,241,53,0.3)] bg-[rgba(200,241,53,0.1)] px-4 py-2">
        <span className="bg-lime h-2 w-2 animate-pulse rounded-full" />
        <span className="text-xs font-medium uppercase tracking-widest text-lime">
          Planejamento mensal para Instagram
        </span>
      </AnimateOnLoad>

      <AnimateOnLoad delay={300} className="relative z-10 mb-8">
        <h1 className="font-bebas text-[clamp(56px,10vw,140px)] leading-[0.92] tracking-wide">
          SEU NEGÓCIO
          <br />
          <span className="text-lime">PRECISA</span>
          <br />
          APARECER
          <span className="mt-4 block font-sans text-[clamp(18px,3vw,44px)] font-light tracking-widest text-muted-foreground">
            todos os dias. sem desculpa.
          </span>
        </h1>
      </AnimateOnLoad>

      <AnimateOnLoad delay={500} className="relative z-10 mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        <p>
          O CR3SCE entrega{" "}
          <strong className="text-foreground">
            30 dias de conteúdo planejado para o Instagram
          </strong>{" "}
          — roteiro, horário e estratégia — pra você focar no que importa:
          vender.
        </p>
      </AnimateOnLoad>

      <AnimateOnLoad delay={700} className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/auth/sign-up"
          className="border border-white/10 bg-primary px-10 py-4 text-base font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#333333]"
        >
          Começar agora →
        </Link>
        <Link
          href="#como"
          className="border border-border px-8 py-4 text-sm text-muted-foreground transition-all hover:border-muted-foreground hover:text-foreground"
        >
          Como funciona
        </Link>
      </AnimateOnLoad>

      <AnimateOnLoad delay={900} className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex">
            {["#C8F135", "#f1a135", "#35adf1", "#f135a0", "#a835f1"].map(
              (color, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background font-bebas text-xs font-bold text-background"
                  style={{ background: color, marginLeft: i > 0 ? "-10px" : "0" }}
                >
                  {["M", "R", "J", "A", "L"][i]}
                </div>
              ),
            )}
          </div>
          <div className="text-left">
            <div className="text-xs tracking-widest text-lime">★★★★★</div>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">
                +340 empreendedores
              </strong>{" "}
              já crescendo
            </p>
          </div>
        </div>
      </AnimateOnLoad>
    </section>
  );
}
