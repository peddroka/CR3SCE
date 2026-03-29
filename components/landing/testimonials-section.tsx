"use client";

import { motion } from "framer-motion";

const logos = [
  "PIZZARIA NAPOLI",
  "MERCADO ESTRELA",
  "BELEZA PURA",
  "STUDIO FIT BH",
  "PADARIA NOVA AURORA",
  "CLÍNICA SORRISO",
];

const testimonials = [
  {
    color: "#C8F135",
    initial: "M",
    name: "Mariana Costa",
    role: "Pizzaria Napoli — São Paulo, SP",
    text: "Eu não sabia o que postar, quando postar, nada. Com o CR3SCE chegou tudo pronto. Em 3 semanas meu Instagram triplicou o engajamento.",
  },
  {
    color: "#f1a135",
    initial: "R",
    name: "Roberto Alves",
    role: "Mercado Estrela — Recife, PE",
    text: "Eu pagava R$1.200 por mês pra um social media que sumia. Hoje gasto R$79,90 e o resultado é infinitamente melhor.",
  },
  {
    color: "#35adf1",
    initial: "J",
    name: "Juliana Melo",
    role: "Beleza Pura — Fortaleza, CE",
    text: "Minha agenda tava vazia. Comecei o CR3SCE, segui o planejamento e em 45 dias lotei os horários do mês inteiro.",
  },
  {
    color: "#a835f1",
    initial: "C",
    name: "Carlos Henrique",
    role: "Studio Fit BH — Belo Horizonte, MG",
    text: "O planejamento vem personalizado pro meu negócio. Primeiro mês já trouxe 12 alunos novos direto do Instagram.",
  },
  {
    color: "#f135a0",
    initial: "P",
    name: "Paulo Augusto",
    role: "Padaria Nova Aurora — Curitiba, PR",
    text: "A padaria tava invisível no Instagram. Em 2 meses um post viralizou e a fila chegou na calçada.",
  },
  {
    color: "#35f1a0",
    initial: "D",
    name: "Dra. Fernanda Lima",
    role: "Clínica Sorriso — Salvador, BA",
    text: "Dentista não tem tempo pra ficar pensando em post. O CR3SCE resolveu isso. Hoje tenho lista de espera de 3 semanas.",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="depoimentos"
      className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 md:mb-20"
      >
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Quem já usa
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          ELES DECIDIRAM
          <br />
          CRESCER.
        </h2>
      </motion.div>

      <div className="mb-8 flex flex-wrap border border-border">
        {logos.map((logo, i) => (
          <div
            key={i}
            className="flex-1 whitespace-nowrap border-b border-r border-border px-6 py-5 text-center font-bebas text-sm tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {logo}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="border border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:border-[#C8F135]/20"
          >
            <div className="mb-4 text-xs tracking-[0.3em] text-lime">
              ★★★★★
            </div>
            <p className="mb-6 text-sm italic leading-relaxed text-muted-foreground">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bebas text-lg text-background"
                style={{ background: t.color }}
              >
                {t.initial}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
