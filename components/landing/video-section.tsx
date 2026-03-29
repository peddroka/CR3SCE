"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  const videoUrl =
    "https://www.youtube.com/embed/SEU_VIDEO_ID?autoplay=1&rel=0&modestbranding=1";
  const thumbnailUrl: string | null = null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32 lg:px-16 lg:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-center md:mb-20"
      >
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-lime md:mb-6">
          Entenda em 90 segundos
        </p>
        <h2 className="font-bebas text-[clamp(32px,5vw,64px)] leading-tight">
          PARA QUEM E O <span className="text-lime">CR3SCE</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Antes de assinar, entenda exatamente quem vai se beneficiar do CR3SCE
          e por que ele existe.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card"
      >
        {playing ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Para quem e o CR3SCE"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Thumbnail do video do CR3SCE"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary" />
            )}

            <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-5">
              <span className="font-bebas text-[200px] leading-none text-foreground">
                CR3SCE
              </span>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8F135]/10 blur-3xl" />

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setPlaying(true)}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-[#C8F135]/30 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-lime shadow-[0_0_40px_rgba(200,241,53,0.4)] transition-shadow hover:shadow-[0_0_60px_rgba(200,241,53,0.6)]">
                  <Play className="ml-1 size-8 text-background" fill="currentColor" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">Assistir agora</p>
                <p className="text-sm text-muted-foreground">~90 segundos</p>
              </div>
            </motion.button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap justify-center gap-3"
      >
        {[
          "Donos de restaurante",
          "Donos de comercio",
          "Salao & Estetica",
          "Academia & Personal",
          "Clinicas & Saude",
          "Prestadores de servico",
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-white/5 px-4 py-1.5 text-xs text-[#c0c0c0]"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
