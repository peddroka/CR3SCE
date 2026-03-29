"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "cr3sce_tour_done";

interface TourStep {
  emoji: string;
  title: string;
  description: string;
  targetId: string;
  arrowDir: "left" | "right" | "up" | "down" | "down-right" | "none";
  modalSide: "right" | "left" | "bottom" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: "👋",
    title: "Bem-vindo ao CR3SCE!",
    description:
      "Esta e sua pagina inicial. Aqui voce acompanha seu progresso, ve a dica do dia e conversa com sua IA pessoal de marketing.",
    targetId: "nav-inicio",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "📅",
    title: "Calendario de Conteudo",
    description:
      "No Calendario voce encontra todos os posts do mes com roteiro completo, horario estrategico e hashtags personalizadas.",
    targetId: "nav-calendario",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "🗺️",
    title: "Jornada de Evolucao",
    description:
      "Na Evolucao voce acompanha sua jornada de crescimento. Complete missoes em ordem para desbloquear as proximas fases.",
    targetId: "nav-evolucao",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "⚡",
    title: "Modo Tendencia",
    description:
      "Veja o que esta bombando no seu nicho agora e receba ideias prontas de conteudo viral para postar.",
    targetId: "nav-tendencia",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "🏆",
    title: "Suas Conquistas",
    description:
      "Acompanhe seu progresso, desbloqueie conquistas e veja um relatorio completo da sua evolucao.",
    targetId: "nav-conquistas",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "⭐",
    title: "Score do Perfil",
    description:
      "A IA analisa o print da sua bio do Instagram e da uma nota de 0 a 100 com diagnostico completo e 3 opcoes de bio otimizada para o seu nicho.",
    targetId: "nav-score",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "⚙️",
    title: "Configuracoes",
    description:
      "Edite seu nome e Instagram. As informacoes do negocio sao atualizadas na renovacao mensal.",
    targetId: "nav-configuracoes",
    arrowDir: "left",
    modalSide: "right",
  },
  {
    emoji: "🤖",
    title: "Sua IA Pessoal",
    description:
      "Logo abaixo nesta pagina voce tem acesso direto a sua IA. Peca ideias, tire duvidas de marketing — ela conhece o seu negocio.",
    targetId: "inline-chat-section",
    arrowDir: "down",
    modalSide: "center",
  },
  {
    emoji: "🚀",
    title: "Sua sequencia de posts",
    description:
      "O foguete mostra quantos dias seguidos voce esta postando. Quanto mais dias consecutivos, mais forte fica o foguete. Mantenha a sequencia para o algoritmo te favorecer!",
    targetId: "streak-indicator",
    arrowDir: "right",
    modalSide: "left",
  },
  {
    emoji: "💬",
    title: "Suporte CR3SCE",
    description:
      "O botao verde no canto inferior direito e o suporte. Qualquer duvida sobre a plataforma, clique nele.",
    targetId: "support-button",
    arrowDir: "down-right",
    modalSide: "left",
  },
];

function FloatingArrow({
  dir,
  targetRect,
}: {
  dir: TourStep["arrowDir"];
  targetRect: DOMRect | null;
}) {
  if (!targetRect || dir === "none") return null;

  let style: CSSProperties = {
    position: "fixed",
    zIndex: 303,
    pointerEvents: "none",
  };

  if (dir === "left") {
    style = {
      ...style,
      top: targetRect.top + targetRect.height / 2 - 20,
      left: targetRect.right + 8,
    };
  } else if (dir === "right") {
    style = {
      ...style,
      top: targetRect.top + targetRect.height / 2 - 20,
      left: Math.max(targetRect.left - 78, 8),
    };
  } else if (dir === "up") {
    style = {
      ...style,
      bottom: window.innerHeight - targetRect.top + 8,
      left: targetRect.left + targetRect.width / 2 - 20,
    };
  } else if (dir === "down") {
    style = {
      ...style,
      top: targetRect.bottom + 8,
      left: targetRect.left + targetRect.width / 2 - 20,
    };
  } else if (dir === "down-right") {
    style = {
      ...style,
      bottom: window.innerHeight - targetRect.top + 8,
      right: window.innerWidth - targetRect.right + 8,
    };
  }

  const paths: Record<string, { path: string; vb: string; w: number; h: number }> = {
    left: {
      path: "M 55 15 C 35 15, 18 18, 8 20 M 8 20 L 20 11 M 8 20 L 20 29",
      vb: "0 0 65 40",
      w: 65,
      h: 40,
    },
    right: {
      path: "M 10 15 C 30 15, 47 18, 57 20 M 57 20 L 45 11 M 57 20 L 45 29",
      vb: "0 0 65 40",
      w: 65,
      h: 40,
    },
    down: {
      path: "M 20 5 C 20 25, 20 40, 20 55 M 20 55 L 11 42 M 20 55 L 29 42",
      vb: "0 0 40 65",
      w: 40,
      h: 65,
    },
    up: {
      path: "M 20 60 C 20 40, 20 25, 20 10 M 20 10 L 11 23 M 20 10 L 29 23",
      vb: "0 0 40 65",
      w: 40,
      h: 65,
    },
    "down-right": {
      path: "M 10 10 C 15 35, 40 48, 58 58 M 58 58 L 43 54 M 58 58 L 54 43",
      vb: "0 0 70 70",
      w: 70,
      h: 70,
    },
  };

  const c = paths[dir] || paths.left;

  return (
    <motion.svg
      style={style}
      width={c.w}
      height={c.h}
      viewBox={c.vb}
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={`arrow-${dir}-${targetRect.top}`}
    >
      <motion.path
        d={c.path}
        stroke="#C8F135"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      />
    </motion.svg>
  );
}

export function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const checkTour = async () => {
      try {
        const res = await fetch("/api/tour/status");
        const data = await res.json();
        setChecked(true);
        if (!data.completed) {
          localStorage.removeItem(TOUR_KEY);
          setShow(true);
        } else {
          setShow(false);
        }
      } catch {
        const localDone = localStorage.getItem(TOUR_KEY) === "1";
        setChecked(true);
        if (!localDone) setShow(true);
      }
    };
    void checkTour();
  }, []);

  useEffect(() => {
    if (!show) return;
    const current = TOUR_STEPS[step];
    const updateRect = () => {
      const el = document.getElementById(current.targetId);
      if (el) setTargetRect(el.getBoundingClientRect());
      else setTargetRect(null);
    };
    updateRect();
    const t = window.setTimeout(updateRect, 350);
    return () => window.clearTimeout(t);
  }, [step, show]);

  const finish = async () => {
    setShow(false);
    try {
      await fetch("/api/tour/complete", { method: "POST" });
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      localStorage.setItem(TOUR_KEY, "1");
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("show-notices"));
    }, 20000);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("show-tip", {
          detail: {
            message: "Dica: grave todos os conteudos antes e va postando aos poucos. Isso otimiza seu tempo e mantem consistencia!",
          },
        }),
      );
    }, 120000);
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else void finish();
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!checked) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const getOverlayClipPath = () => {
    if (!targetRect) return undefined;
    const pad = 8;
    const t = targetRect.top - pad;
    const l = targetRect.left - pad;
    const r = targetRect.right + pad;
    const b = targetRect.bottom + pad;
    const w = window.innerWidth;
    const h = window.innerHeight;
    return `polygon(
      0 0, ${w}px 0, ${w}px ${h}px, 0 ${h}px, 0 0,
      ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px
    )`;
  };

  const getModalStyle = (): CSSProperties => {
    if (!targetRect || current.modalSide === "center") {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const pad = 24;
    const modalW = 340;
    switch (current.modalSide) {
      case "right":
        return {
          position: "fixed",
          top: Math.min(
            Math.max(targetRect.top - 60, pad),
            window.innerHeight - 420,
          ),
          left: Math.min(
            targetRect.right + 100,
            window.innerWidth - modalW - pad,
          ),
        };
      case "left":
        return {
          position: "fixed",
          top: Math.min(Math.max(targetRect.top, pad), window.innerHeight - 420),
          right: Math.max(window.innerWidth - targetRect.left + 80, pad),
        };
      case "bottom":
        return {
          position: "fixed",
          top: targetRect.bottom + pad,
          left: Math.max(
            Math.min(targetRect.left + targetRect.width / 2 - modalW / 2, window.innerWidth - modalW - pad),
            pad,
          ),
        };
      default:
        return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key={`overlay-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 299,
              background: "rgba(0,0,0,0.78)",
              clipPath: getOverlayClipPath(),
            }}
            onClick={() => void finish()}
          />

          {targetRect && (
            <motion.div
              key={`border-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderRadius: 12,
                border: "2px solid rgba(200,241,53,0.7)",
                boxShadow: "0 0 16px rgba(200,241,53,0.3)",
                pointerEvents: "none",
                zIndex: 300,
              }}
            />
          )}

          <FloatingArrow dir={current.arrowDir} targetRect={targetRect} />

          <motion.div
            key={`modal-${step}`}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{ ...getModalStyle(), zIndex: 302, width: 340 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-border">
              <motion.div
                className="h-full bg-[#C8F135]"
                animate={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/10 text-3xl"
                >
                  {current.emoji}
                </motion.div>
              </div>

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                {step + 1} / {TOUR_STEPS.length}
              </p>
              <h2 className="mb-2 text-lg font-bold text-white">{current.title}</h2>
              <p className="mb-5 text-sm leading-relaxed text-[#888]">{current.description}</p>

              <div className="mb-5 flex items-center justify-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? "w-5 bg-[#C8F135]" : i < step ? "w-1.5 bg-[#C8F135]/40" : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={prev}
                    size="sm"
                    className="border-border bg-white/5 text-[#888] hover:text-white"
                  >
                    <ChevronLeft className="mr-1 size-3.5" />
                    Voltar
                  </Button>
                )}
                <Button
                  onClick={next}
                  size="sm"
                  className="flex-1 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
                >
                  {isLast ? "Começar agora!" : "Próximo"}
                  {!isLast && <ChevronRight className="ml-1 size-3.5" />}
                </Button>
              </div>

              {!isLast && (
                <button
                  onClick={() => void finish()}
                  className="mt-3 w-full text-center text-[11px] text-[#444] transition-colors hover:text-[#666]"
                >
                  Pular tutorial
                </button>
              )}
            </div>

            <button
              onClick={() => void finish()}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[#555] transition-colors hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


