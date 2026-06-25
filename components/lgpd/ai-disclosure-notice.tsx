"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "cr3sce_ai_disclosure_dismissed";

export function AIDisclosureNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-lime/30 bg-lime/5 p-3 text-sm"
    >
      <Sparkles className="mt-0.5 size-4 shrink-0 text-lime" />
      <div className="flex-1 text-muted-foreground">
        <p>
          <strong className="text-foreground">Este recurso usa IA.</strong>{" "}
          Suas mensagens são processadas por um modelo de linguagem (Groq) e o
          contexto do seu negócio é enviado para gerar a resposta. Solicitamos
          contratualmente que o provedor não use seu conteúdo para treinamento.
          O conteúdo gerado pode conter imprecisões - revise antes de usar.{" "}
          <Link
            href="/politica-de-privacidade"
            target="_blank"
            className="text-lime hover:underline"
          >
            Saiba mais
          </Link>
          .
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Entendi, não mostrar de novo"
        className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
