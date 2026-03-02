"use client";

import { ClipboardList, Brain, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Responda o questionário",
    description:
      "Conte-nos sobre seu negócio, público-alvo, objetivos e estilo de comunicação em poucos minutos.",
  },
  {
    icon: Brain,
    step: "02",
    title: "A IA cria sua estratégia",
    description:
      "Nossa inteligência artificial analisa seus dados e gera uma estratégia de marketing completa e personalizada.",
  },
  {
    icon: CalendarDays,
    step: "03",
    title: "Receba seu calendário",
    description:
      "Veja um calendário de 30 dias com postagens detalhadas, horários ideais e tipos de conteúdo para cada dia.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20 lg:py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 lg:mb-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Como <span className="text-primary">funciona</span>
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground px-4">
            Três passos simples para transformar seu marketing digital com
            inteligência artificial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative flex flex-col items-center rounded-xl border border-primary/10 bg-card/50 p-6 sm:p-8 text-center transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg"
            >
              <div className="mb-4 flex size-12 sm:size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <item.icon className="size-6 sm:size-7" />
              </div>
              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Passo {item.step}
              </span>
              <h3 className="mb-3 text-base sm:text-lg font-semibold">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
