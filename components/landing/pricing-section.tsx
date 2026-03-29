"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  "Calendario completo de 30 dias para o Instagram",
  "Roteiro de cada post - legenda, formato e CTA",
  "Horario estrategico personalizado pro seu publico",
  "Planejamento para Instagram - feed, reels e stories",
  "IA pessoal de marketing integrada",
  "Suporte durante todo o mes",
];

export function PricingSection() {
  return (
    <section
      id="preco"
      className="mx-auto max-w-6xl px-6 py-20 text-center md:px-12 md:py-32 lg:px-16 lg:py-40"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 md:mb-20"
      >
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Investimento
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          SEM SURPRESA.
          <br />
          SEM ENROLACAO.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Ao inves de pagar <strong className="text-white">R$2.000+</strong> por
          mes para um social media profissional, voce paga apenas{" "}
          <strong className="text-lime">R$79,90</strong> com o plano anual ou{" "}
          <strong className="text-white">R$99,90</strong> no mensal.
        </p>
      </motion.div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:flex-row md:items-end md:justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative w-full overflow-hidden border border-border bg-card p-8 text-left md:w-72 md:self-end"
        >
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Plano Mensal
          </p>

          <div className="mb-1 font-bebas leading-none">
            <span className="text-xl text-muted-foreground">R$</span>
            <span className="text-[60px]">99</span>
            <span className="text-lg text-muted-foreground">,90/mes</span>
          </div>

          <p className="mb-6 text-xs text-muted-foreground">
            Cobrado mensalmente - Cancele quando quiser
          </p>

          <ul className="mb-8 flex flex-col gap-2.5">
            {features.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-0.5 shrink-0 font-bold text-white/30">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/auth/sign-up"
            className="block w-full border border-white/10 bg-white/5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
          >
            Comecar mensalmente
          </Link>

          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Sem fidelidade - Cancele quando quiser
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative w-full overflow-hidden border border-lime/50 bg-card p-10 text-left shadow-[0_0_60px_rgba(200,241,53,0.12)] md:w-96"
        >
          <div className="absolute left-0 right-0 top-0 h-0.75 bg-lime" />

          <div className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#111]">
            Mais popular
          </div>

          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-lime">
            Plano Anual - Melhor opcao
          </p>

          <div className="mb-1 font-bebas leading-none">
            <span className="text-2xl text-muted-foreground">R$</span>
            <span className="text-[88px] text-lime">79</span>
            <span className="text-xl text-muted-foreground">,90/mes</span>
          </div>

          <p className="mb-1 text-xs text-muted-foreground">
            Cobrado anualmente - R$958,80/ano
          </p>
          <p className="mb-8 text-xs font-medium text-lime">
            Voce economiza R$239,90 por ano - 2 meses gratis
          </p>

          <ul className="mb-8 flex flex-col gap-3">
            {features.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 shrink-0 font-bold text-lime">+</span>
                <span>{item}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 shrink-0 font-bold text-lime">+</span>
              <span className="font-medium text-lime">
                Garantia de 7 dias ou seu dinheiro de volta
              </span>
            </li>
          </ul>

          <Link
            href="/auth/sign-up"
            className="block w-full border border-lime/20 bg-lime py-5 text-center text-sm font-bold uppercase tracking-widest text-[#111] transition-all hover:-translate-y-0.5 hover:bg-[#a8d020]"
          >
            Quero o plano anual {"->"}
          </Link>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pagamento seguro - Fidelidade anual
          </p>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-8 text-xs text-muted-foreground"
      >
        * Plano mensal: cancele quando quiser, sem multa. Plano anual:
        fidelidade de 12 meses. Cancelamento antecipado sujeito a multa
        proporcional.
      </motion.p>
    </section>
  );
}
