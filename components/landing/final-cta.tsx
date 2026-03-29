"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-20 text-center md:py-32 lg:py-40">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-bebas text-[clamp(80px,18vw,220px)] leading-none text-foreground/[0.02]"
        aria-hidden
      >
        CR3SCE
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,241,53,0.08)_0%,transparent_70%)]" />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 mb-8 font-bebas text-[clamp(48px,8vw,110px)] leading-[0.95]"
      >
        SEU NEGÓCIO
        <br />
        <span className="text-lime">PRONTO</span>
        <br />
        PRA CRESCER?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-auto mb-12 max-w-md text-lg text-muted-foreground"
      >
        Mais de 340 empreendedores já pararam de improvisar no Instagram. Agora
        é a sua vez.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <Link
          href="/auth/sign-up"
          className="inline-block border border-white/10 bg-primary px-16 py-5 text-base font-bold uppercase tracking-widest text-primary-foreground transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-[#333333]"
        >
          Começar agora →
        </Link>
      </motion.div>
    </section>
  );
}
