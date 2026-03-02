"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Mensal",
    price: "79",
    cents: "90",
    period: "/mês",
    description: "Ideal para quem quer começar a crescer agora.",
    features: [
      "Estratégias mensais ilimitadas",
      "Calendário de 30 dias",
      "Chat com a IA",
      "Atualizações automáticas",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Anual",
    price: "59",
    cents: "90",
    period: "/mês",
    description: "Economize 25% com o plano anual. Melhor custo-benefício.",
    badge: "Mais Popular",
    features: [
      "Tudo do plano Mensal",
      "Economia de 25%",
      "Estratégias prioritárias",
      "Análise de concorrentes",
      "Suporte prioritário",
      "Novos recursos em primeira mão",
    ],
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="precos" className="py-16 sm:py-20 lg:py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 lg:mb-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Planos <span className="text-primary">simples</span> e transparentes
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground px-4">
            Escolha o plano ideal para o crescimento do seu negócio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={cn(
                "relative flex flex-col rounded-xl border p-6 sm:p-8",
                plan.popular
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-primary/10 bg-card/50",
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-4 sm:mb-6 flex items-baseline">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  R$
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-sm sm:text-base font-bold">
                  ,{plan.cents}
                </span>
                <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <ul className="mb-6 sm:mb-8 flex flex-1 flex-col gap-2 sm:gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                  >
                    <Check className="size-3 sm:size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full text-sm sm:text-base"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href="/auth/sign-up">Começar Agora</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
