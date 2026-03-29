"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Preciso ter experiência com Instagram?",
    a: "Não. O CR3SCE foi feito exatamente pra quem não entende de redes sociais. Você recebe tudo pronto — só precisa seguir o planejamento e postar.",
  },
  {
    q: "Funciona pra qualquer tipo de negócio?",
    a: "Sim. Restaurantes, salões, lojas, prestadores de serviço, clínicas, academias — qualquer negócio que precise de presença constante no Instagram.",
  },
  {
    q: "Em quanto tempo recebo o planejamento?",
    a: "Em até 3 dias úteis após você preencher o formulário sobre o seu negócio. O planejamento completo chega direto no seu WhatsApp.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa, sem burocracia. Se por qualquer motivo você quiser cancelar, é só falar com a gente.",
  },
  {
    q: "Inclui criação de artes e vídeos?",
    a: "O plano inclui o planejamento estratégico completo — roteiro, horário e formato. A criação das artes fica com você, mas o roteiro deixa tudo tão claro que qualquer pessoa consegue executar.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 md:mb-20"
      >
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Dúvidas
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          PERGUNTAS
          <br />
          FREQUENTES
        </h2>
      </motion.div>

      <div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="group flex w-full items-center justify-between gap-6 py-7 text-left"
            >
              <span className="text-base font-medium transition-colors group-hover:text-lime">
                {faq.q}
              </span>
              <Plus
                className={`size-5 shrink-0 text-lime transition-transform duration-300 ${
                  open === i ? "rotate-45" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
