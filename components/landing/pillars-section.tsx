"use client";

import { AnimateOnScroll } from "@/components/ui/animate";

const pillars = [
  {
    num: "1",
    label: "Pilar 01 - O QUE",
    title: "CONTEÚDO",
    desc: "Roteiro completo de cada post - tema, legenda e call to action. Você nunca mais vai ficar em branco na frente do celular.",
  },
  {
    num: "2",
    label: "Pilar 02 - QUANDO",
    title: "FREQUÊNCIA",
    desc: "Horário e dia definidos para cada publicação. Consistência é o que o algoritmo mais valoriza - e o CR3SCE garante isso.",
  },
  {
    num: "3",
    label: "Pilar 03 - POR QUE",
    title: "ESTRATÉGIA",
    desc: "Cada post tem um objetivo - engajamento, autoridade ou venda. Conteúdo sem estratégia é só barulho. Com o CR3SCE, vira resultado.",
  },
];

export function PillarsSection() {
  return (
    <section
      className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40"
    >
      <AnimateOnScroll className="mb-14 md:mb-20">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          O Método
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          POR QUE O <span className="text-lime">3</span>?
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          O número 3 no nome não é enfeite. Ele representa os{" "}
          <strong className="text-foreground">
            3 pilares que todo negócio precisa
          </strong>{" "}
          para crescer no Instagram - e que a maioria nunca resolve ao mesmo
          tempo.
        </p>
      </AnimateOnScroll>

      <div className="mt-14 grid grid-cols-1 gap-px bg-border md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <AnimateOnScroll
            key={index}
            delay={index * 150}
            className="relative overflow-hidden bg-background p-8 transition-colors hover:bg-card md:p-12"
          >
            <span className="absolute right-3 top-0 select-none font-bebas text-[140px] leading-none text-[#C8F135]/5">
              {pillar.num}
            </span>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-lime">
              {pillar.label}
            </p>
            <h3 className="mb-4 font-bebas text-3xl tracking-wide">
              {pillar.title}
            </h3>
            <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">
              {pillar.desc}
            </p>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll className="mt-px flex flex-col items-center gap-10 border-t border-border bg-card p-10 md:flex-row">
        <span className="shrink-0 font-bebas text-[140px] leading-none text-lime">
          3
        </span>
        <div>
          <h3 className="mb-4 font-bebas text-3xl tracking-wide">
            O 3 NÃO É UM NÚMERO.
            <br />
            É O MÉTODO.
          </h3>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Quando você vê <strong className="text-lime">CR3SCE</strong> escrito,
            o 3 no meio não é enfeite. Ele representa os{" "}
            <strong className="text-foreground">
              3 pilares que o seu negócio precisa
            </strong>{" "}
            para crescer de verdade no Instagram - e que o CR3SCE entrega todo
            mês, completo, sem você precisar pensar nisso. Fala "cresce". Todo
            mundo entende. Mas quando vê escrito, nunca mais esquece.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
