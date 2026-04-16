"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate";

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

function FaqItem({ faq, isOpen, toggle }: { faq: typeof faqs[0]; isOpen: boolean; toggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-border">
      <button
        onClick={toggle}
        className="group flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="text-base font-medium transition-colors group-hover:text-lime">
          {faq.q}
        </span>
        <Plus
          className={`size-5 shrink-0 text-lime transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height }}
      >
        <div ref={contentRef}>
          <p className="pb-7 text-sm leading-relaxed text-muted-foreground">
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40">
      <AnimateOnScroll className="mb-14 md:mb-20">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Dúvidas
        </p>
        <h2 className="font-bebas text-[clamp(36px,5vw,72px)] leading-tight">
          PERGUNTAS
          <br />
          FREQUENTES
        </h2>
      </AnimateOnScroll>

      <div>
        {faqs.map((faq, i) => (
          <FaqItem
            key={i}
            faq={faq}
            isOpen={open === i}
            toggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}
