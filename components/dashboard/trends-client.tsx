"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TrendIdea {
  content_type: string;
  trend_name: string;
  audio_used: string;
  on_screen_text: string;
  creator_action: string;
  how_it_works: string;
  adapted_script: string;
  recording_instructions: string;
}

interface Props {
  business: {
    niche: string;
    platforms: string;
    business_name: string;
  } | null;
}

function normalizeText(value: string) {
  let result = value || "";

  for (let i = 0; i < 2; i += 1) {
    if (!/[ÃÂâð]/.test(result)) break;

    try {
      result = decodeURIComponent(escape(result));
    } catch {
      break;
    }
  }

  return result.replace(/\uFFFD/g, "");
}

function normalizeIdea(idea: TrendIdea): TrendIdea {
  return {
    content_type: normalizeText(idea.content_type),
    trend_name: normalizeText(idea.trend_name),
    audio_used: normalizeText(idea.audio_used),
    on_screen_text: normalizeText(idea.on_screen_text),
    creator_action: normalizeText(idea.creator_action),
    how_it_works: normalizeText(idea.how_it_works),
    adapted_script: normalizeText(idea.adapted_script),
    recording_instructions: normalizeText(idea.recording_instructions),
  };
}

export function TrendsClient({ business }: Props) {
  const [ideas, setIdeas] = useState<TrendIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<TrendIdea | null>(null);

  const fetchTrends = async () => {
    if (!business) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: business.niche,
          platforms: business.platforms,
          business_name: business.business_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Nao foi possivel buscar trends agora.",
        );
      }

      if (Array.isArray(data.ideas)) {
        setIdeas(data.ideas.map(normalizeIdea));
        setLastUpdated(
          typeof data.updated_at === "string" ? new Date(data.updated_at) : new Date(),
        );
      } else {
        throw new Error("Nenhuma trend valida foi retornada.");
      }
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Nao foi possivel buscar trends agora.";
      setError(normalizeText(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
            <Zap className="size-7 text-[#C8F135]" />
            Modo Tendência
          </h1>
          <p className="mt-1 text-sm text-[#888]">
            Tendências atuais adaptadas para o seu nicho, com estrutura pronta para gravar.
          </p>
        </div>
        <Button
          onClick={fetchTrends}
          disabled={loading}
          className="gap-2 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Atualizando tendências...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              {ideas.length > 0 ? "Atualizar tendências" : "Buscar tendências"}
            </>
          )}
        </Button>
      </div>

      {business && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 text-sm text-[#c0c0c0]">
            <TrendingUp className="size-4 text-[#C8F135]" />
            Nicho: <span className="font-medium text-white">{business.niche}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 text-sm text-[#c0c0c0]">
            <Sparkles className="size-4 text-[#C8F135]" />
            3 trends adaptadas para {business.business_name}
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 rounded-full border border-[#C8F135]/20 bg-[#C8F135]/5 px-4 py-2 text-sm text-[#C8F135]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C8F135]" />
              Atualizado às{" "}
              {lastUpdated.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {!loading && ideas.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-20 text-center"
        >
          <div className="flex size-20 items-center justify-center rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10">
            <Zap className="size-10 text-[#C8F135]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Veja padrões que estão funcionando agora
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#888]">
              Busque 3 trends atuais e receba a adaptação pronta para o seu nicho,
              com nome da trend, funcionamento, roteiro e instrução de gravação.
            </p>
          </div>
          <Button
            onClick={fetchTrends}
            disabled={loading}
            size="lg"
            className="gap-2 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
          >
            <Zap className="size-5" />
            Buscar tendências agora
          </Button>
        </motion.div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3 h-4 w-20 rounded bg-white/10" />
              <div className="mb-2 h-5 w-3/4 rounded bg-white/10" />
              <div className="mb-2 h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-5/6 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {!loading && ideas.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ideas.map((idea, index) => (
              <motion.div
                key={`${idea.trend_name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className="h-full cursor-pointer rounded-2xl border border-border bg-card transition-all hover:border-[#C8F135]/30"
                  onClick={() => setExpandedIdea(idea)}
                >
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-3 py-1 text-xs font-semibold text-[#C8F135]">
                        {idea.content_type}
                      </span>
                      <span className="text-xs text-[#888]">Trend {index + 1}</span>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#888]">
                        Nome da trend
                      </p>
                      <h3 className="text-lg font-bold leading-snug text-white">
                        {idea.trend_name}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm text-[#b7b7b7]">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#555]">
                          Como funciona
                        </p>
                        <p className="line-clamp-3 leading-relaxed">
                          {idea.how_it_works}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#555]">
                          Áudio
                        </p>
                        <p className="line-clamp-2 leading-relaxed">{idea.audio_used}</p>
                      </div>
                    </div>

                    <span className="mt-auto text-sm font-medium text-[#C8F135]">
                      Ver adaptação completa →
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedIdea && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedIdea(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setExpandedIdea(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#666] transition-colors hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                  {expandedIdea.content_type}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {expandedIdea.trend_name}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">
                    Como ela funciona
                  </p>
                  <p className="text-sm leading-relaxed text-[#d1d5db]">
                    {expandedIdea.how_it_works}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">
                      Áudio usado
                    </p>
                    <p className="text-sm leading-relaxed text-[#d1d5db]">
                      {expandedIdea.audio_used}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">
                      Texto na tela
                    </p>
                    <p className="text-sm leading-relaxed text-[#d1d5db]">
                      {expandedIdea.on_screen_text}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">
                      Ação do criador
                    </p>
                    <p className="text-sm leading-relaxed text-[#d1d5db]">
                      {expandedIdea.creator_action}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                    Roteiro adaptado para o cliente
                  </p>
                  <p className="text-sm leading-relaxed text-white">
                    {expandedIdea.adapted_script}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">
                    Instrução de gravação
                  </p>
                  <p className="text-sm leading-relaxed text-[#d1d5db]">
                    {expandedIdea.recording_instructions}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
