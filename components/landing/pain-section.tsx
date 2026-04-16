"use client";

import { AnimateOnScroll } from "@/components/ui/animate";

const pains = [
  {
    title: "Não sabe o que postar",
    desc: "Abre o Instagram, fica olhando pra tela em branco e fecha sem postar nada. Todo santo dia.",
  },
  {
    title: "Posta sem frequência",
    desc: "Uma semana posta todo dia, depois some por um mês. O algoritmo te esquece. O cliente também.",
  },
  {
    title: "Social media caro demais",
    desc: "R$900, R$1.500 por mês pra alguém postar por você. Inviável pra quem tá construindo o negócio.",
  },
  {
    title: "Engajamento zero",
    desc: "Posta, ninguém vê. Sem estratégia, conteúdo não vira cliente.",
  },
];

export function PainSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40">
      <AnimateOnScroll className="mb-14 md:mb-20">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          O Problema
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          VOCÊ RECONHECE
          <br />
          ALGUMA DESSAS?
        </h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
        {pains.map((pain, i) => (
          <AnimateOnScroll
            key={i}
            delay={i * 100}
            className="flex items-start gap-6 bg-background p-10 transition-colors hover:bg-card"
          >
            <span className="mt-0.5 shrink-0 font-bebas text-3xl leading-none text-destructive">
              ✗
            </span>
            <div>
              <h3 className="mb-2 font-bebas text-2xl tracking-wide">
                {pain.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pain.desc}
              </p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
