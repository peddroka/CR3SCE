"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: "📋",
    num: "1",
    title: "Você assina",
    desc: "Preenche um formulário rápido sobre o seu negócio. Sem reunião, sem burocracia.",
  },
  {
    icon: "⚡",
    num: "2",
    title: "Seu calendário fica pronto imediatamente",
    desc: "Assim que termina o cadastro, seu calendário completo já está gerado — roteiro, horário e formato de cada post do mês.",
  },
  {
    icon: "📲",
    num: "3",
    title: "Você só posta",
    desc: "Segue o planejamento, cria o conteúdo com base no social media e posta. Sem pensar. Sem travar.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como"
      className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 md:mb-20"
      >
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          O Processo
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          SIMPLES ASSIM.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative overflow-hidden bg-background p-12 transition-colors hover:bg-card"
          >
            <span className="absolute right-4 top-2 select-none font-bebas text-[100px] leading-none text-[#C8F135]/5">
              {step.num}
            </span>
            <span className="mb-6 block text-3xl">{step.icon}</span>
            <h3 className="mb-3 font-bebas text-2xl tracking-wide">
              {step.title}
            </h3>
            <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
