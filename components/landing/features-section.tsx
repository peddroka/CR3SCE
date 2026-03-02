"use client";

import {
  Zap,
  Target,
  MessageSquare,
  BarChart3,
  Calendar,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Estratégias Instantâneas",
    description:
      "Gere estratégias completas de marketing em segundos com nossa IA avançada.",
  },
  {
    icon: Target,
    title: "100% Personalizado",
    description:
      "Cada estratégia é única, baseada no seu nicho, público e objetivos de negócio.",
  },
  {
    icon: Calendar,
    title: "Calendário de 30 Dias",
    description:
      "Receba um plano diário com tipo de conteúdo, tema e melhor horário para postar.",
  },
  {
    icon: MessageSquare,
    title: "Chat com a IA",
    description:
      "Tire dúvidas e refine suas estratégias conversando diretamente com a IA.",
  },
  {
    icon: BarChart3,
    title: "Insights de Crescimento",
    description:
      "Acompanhe métricas e receba recomendações para otimizar seus resultados.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description:
      "Suas informações são protegidas com criptografia e nunca compartilhadas.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="recursos"
      className="py-16 sm:py-20 lg:py-24 px-4 bg-secondary/30"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 lg:mb-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Tudo que você precisa para{" "}
            <span className="text-primary">crescer</span>
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground px-4">
            Ferramentas poderosas para impulsionar sua presença digital.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-xl border border-primary/10 bg-card/50 p-5 sm:p-6 transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg"
            >
              <div className="mb-3 sm:mb-4 flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-4 sm:size-5" />
              </div>
              <h3 className="mb-2 text-sm sm:text-base font-semibold">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
