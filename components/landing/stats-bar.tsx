"use client";

import { motion } from "framer-motion";

const stats = [
  { num: "340+", label: "Empreendedores ativos" },
  { num: "30", label: "Dias de conteúdo por mês" },
  { num: "3x", label: "Mais engajamento médio" },
];

export function StatsBar() {
  return (
    <div className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="border-r border-border px-10 py-14 text-center transition-colors last:border-r-0 hover:bg-secondary"
          >
            <p className="mb-2 font-bebas text-[clamp(40px,5vw,64px)] leading-none text-lime">
              {stat.num}
            </p>
            <p className="text-xs tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
