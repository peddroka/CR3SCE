"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Tamanho-base (CSS) do celular; a animação só usa transform: scale sobre isso.
const BASE_W = 320;
const BASE_H = 660;

/**
 * Seção imersiva orientada a scroll: um celular surge, sobe e tem a tela
 * "aberta" (escalando até preencher a viewport), revelando a próxima seção
 * informativa dentro da própria página.
 *
 * Performance: NÃO usa state do React durante o scroll — as transformações são
 * escritas direto no DOM (refs) dentro de um rAF, e animamos apenas
 * transform/opacity (compostos na GPU, sem layout/reflow). Resultado: scroll
 * fluido. Respeita prefers-reduced-motion (mostra o estado final, sem animar).
 */
export function PhoneScrollReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const notchRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const phone = phoneRef.current;
    if (!section || !phone) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const render = () => {
      raf = 0;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const rect = section.getBoundingClientRect();
      const total = rect.height - vh;
      let p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      if (reducedMq.matches) p = 1;

      // Entrada (sobe) só no comecinho — termina antes de escalar.
      const enter = clamp(p / 0.18, 0, 1);
      const ty = lerp(64, 0, enter);

      // Abertura completa em ~82% do scroll; o resto "segura" a tela cheia.
      const open = easeInOut(clamp(p / 0.82, 0, 1));
      const cover = Math.max(vw / BASE_W, vh / BASE_H) * 1.06;
      const scale = lerp(1, cover, open);

      phone.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;

      const frameOpacity = String(clamp(1 - open / 0.45, 0, 1));
      if (frameRef.current) frameRef.current.style.opacity = frameOpacity;
      if (notchRef.current) notchRef.current.style.opacity = frameOpacity;
      if (appRef.current)
        appRef.current.style.opacity = String(clamp(1 - (open - 0.04) / 0.26, 0, 1));

      if (revealRef.current) {
        const rv = clamp((open - 0.55) / 0.34, 0, 1);
        revealRef.current.style.opacity = String(rv);
        revealRef.current.style.transform = `translate3d(0, ${lerp(24, 0, rv)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    if (reducedMq.matches) return; // estado final estático, sem listeners

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
  const filledDays = new Set([2, 5, 8, 11, 14, 16, 19, 22, 25, 27, 30]);

  return (
    <section
      ref={sectionRef}
      aria-label="Seu conteúdo na palma da mão"
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Celular (escala via transform — composto na GPU) */}
        <div
          ref={phoneRef}
          className="relative overflow-hidden bg-card shadow-2xl [will-change:transform]"
          style={{
            width: `${BASE_W}px`,
            height: `${BASE_H}px`,
            borderRadius: "46px",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(200,241,53,0.10),transparent_60%)]" />

          <div
            ref={frameRef}
            className="pointer-events-none absolute inset-0 rounded-[inherit] border-[7px] border-[#191919] ring-1 ring-white/10 [will-change:opacity]"
          />
          <div
            ref={notchRef}
            className="pointer-events-none absolute left-1/2 top-3 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-black [will-change:opacity]"
          />

          {/* App preview (calendário) — some ao abrir */}
          <div
            ref={appRef}
            className="absolute inset-0 flex flex-col px-5 pb-6 pt-10 [will-change:opacity]"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-bebas text-lg tracking-wide text-foreground">
                CR3<span className="text-lime">SCE</span>
              </span>
              <span className="size-2 rounded-full bg-lime" />
            </div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-lime">
              Calendário
            </p>
            <p className="mb-4 font-bebas text-2xl leading-none text-foreground">
              SEU MÊS
            </p>
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {weekDays.map((d, i) => (
                <span
                  key={i}
                  className="text-center text-[8px] font-medium text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={
                    filledDays.has(i + 1)
                      ? "aspect-square rounded-md bg-lime/80"
                      : "aspect-square rounded-md border border-white/10 bg-white/5"
                  }
                />
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between rounded-xl border border-border bg-white/5 px-3 py-2.5">
              <span className="text-[11px] text-muted-foreground">
                Plano do mês
              </span>
              <span className="font-bebas text-base text-lime">30 POSTS</span>
            </div>
          </div>
        </div>

        {/* Seção informativa revelada — sobreposta (não escala), entra ao abrir */}
        <div
          ref={revealRef}
          className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center opacity-0 [will-change:transform,opacity]"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
            No seu tempo, do seu jeito
          </p>
          <h2 className="font-bebas text-[clamp(40px,7vw,104px)] leading-[0.95] tracking-wide text-foreground">
            TUDO NA
            <br />
            <span className="text-lime">PALMA DA MÃO</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Seu mês inteiro de conteúdo, organizado. Abra o app e saiba
            exatamente o que postar hoje — sem improviso, sem bloqueio criativo.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["30 dias prontos", "Roteiro + horário", "Direto no bolso"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[rgba(200,241,53,0.3)] bg-[rgba(200,241,53,0.08)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-lime"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
