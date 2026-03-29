"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { createClient, getUserSafely } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Loader2,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const EvolutionMap = dynamic(
  () =>
    import("@/components/dashboard/evolution-map").then((module) => ({
      default: module.EvolutionMap,
    })),
  { ssr: false },
);

function getLevelsCacheKey(userId: string, month: number, year: number) {
  return `evo_levels_${userId}_${month}_${year}`;
}

export default function EvolutionPage() {
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [investment, setInvestment] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [completedChoices, setCompletedChoices] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [insufficientBudget, setInsufficientBudget] = useState(false);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const loadChoices = async () => {
      try {
        const { user } = await getUserSafely(supabase);
        if (!user) return;
        const key = `evo_choices_${user.id}`;
        const saved = localStorage.getItem(key);
        if (saved) setCompletedChoices(JSON.parse(saved));
      } catch {}
    };
    void loadChoices();
  }, [supabase]);

  const loadData = async () => {
    try {
      const { user } = await getUserSafely(supabase);

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setBusiness(businessData);

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: evolution } = await supabase
        .from("evolution_data")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      setEvolutionData(evolution);

      if (evolution) {
        const { data: levelsData } = await supabase
          .from("evolution_levels")
          .select("*")
          .eq("user_id", user.id)
          .eq("month", month)
          .eq("year", year)
          .order("level_number", { ascending: true });

        if (levelsData && levelsData.length > 0) {
          let mergedLevels = levelsData;

          try {
            const cachedRaw = localStorage.getItem(
              getLevelsCacheKey(user.id, month, year),
            );

            if (cachedRaw) {
              const cachedLevels = JSON.parse(cachedRaw) as any[];
              mergedLevels = levelsData.map((level) => {
                const cached = cachedLevels.find(
                  (item) => item.level_number === level.level_number,
                );
                return cached?.options
                  ? { ...level, options: cached.options }
                  : level;
              });
            }
          } catch {}

          setLevels(mergedLevels);
          setShowInitialModal(false);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLevels = async () => {
    if (!investment || !business) return;

    const value = Number(investment.toString().replace(",", "."));

    if (value < 50) {
      setShowInitialModal(false);
      setInsufficientBudget(true);
      return;
    }

    setIsGenerating(true);

    try {
      const { user } = await getUserSafely(supabase);

      if (!user) {
        throw new Error("Usuario nao autenticado");
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const nextEvolutionData = {
        user_id: user.id,
        business_id: business.id,
        current_followers: evolutionData?.current_followers || 0,
        current_stories_views: evolutionData?.current_stories_views || 0,
        monthly_investment: value,
        month,
        year,
      };

      await supabase.from("evolution_data").upsert(nextEvolutionData);
      setEvolutionData(nextEvolutionData);

      const res = await fetch("/api/generate-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investment_amount: value,
          business,
          month_number: 1,
          current_followers: evolutionData?.current_followers || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setLevels(data.levels || []);
      setShowInitialModal(false);
      setInsufficientBudget(false);

      try {
        localStorage.setItem(
          getLevelsCacheKey(user.id, month, year),
          JSON.stringify(data.levels || []),
        );
      } catch {}

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C8F135", "#ffffff"],
      });
    } catch (error) {
      console.error("Erro ao gerar niveis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  async function handleCompleteLevel(levelId: string, chosenOptionId: string) {
    try {
      const { user } = await getUserSafely(supabase);
      if (!user) return;

      setCompletedChoices((prev) => {
        const updated = { ...prev, [levelId]: chosenOptionId };
        try {
          localStorage.setItem(`evo_choices_${user.id}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch (err) {
      console.error("Erro ao salvar escolha:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (insufficientBudget) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
            <TrendingUp className="size-7 text-primary" />
            Jornada de Evolucao
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 text-4xl">
            💰
          </div>
          <h2 className="mb-3 text-xl font-bold text-white">
            Orcamento insuficiente por enquanto
          </h2>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-[#888]">
            Com menos de R$50 disponivel, nao conseguimos montar uma jornada de
            evolucao relevante para o seu negocio. Quando voce tiver um valor
            maior disponivel este mes, volte aqui e libere sua jornada!
          </p>

          <div className="mb-6 rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
              O que voce pode fazer agora
            </p>
            <ul className="space-y-2 text-sm text-[#888]">
              <li className="flex gap-2">
                <span className="shrink-0 text-[#C8F135]">1.</span>
                Foque no calendario de conteudo - postar consistentemente ja gera
                crescimento
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-[#C8F135]">2.</span>
                Quando tiver um valor disponivel, volte aqui e clique em
                "Liberar minha jornada"
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-[#C8F135]">3.</span>
                Mesmo R$100-200 ja permite comecar com equipamentos basicos
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              setInsufficientBudget(false);
              setShowInitialModal(true);
              setInvestment("");
            }}
            className="w-full rounded-xl bg-[#C8F135] py-3 text-sm font-semibold text-[#111] transition-colors hover:bg-[#a8d020]"
          >
            Liberar minha jornada
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <TrendingUp className="size-7 text-primary" />
          Jornada de Evolucao
        </h1>
        <p className="mt-1 text-sm text-[#888888]">
          Complete os niveis em ordem para evoluir sua presenca digital.
        </p>
      </div>

      {levels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl border border-border bg-card">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <h2 className="font-bebas text-xl tracking-wide text-white">
                  Mapa de Evolucao
                </h2>
              </div>
              <EvolutionMap
                levels={levels}
                investment={Number(evolutionData?.monthly_investment || 0)}
                completedChoices={completedChoices}
                onCompleteLevel={handleCompleteLevel}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnimatePresence>
        {showInitialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Rocket className="size-10 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Inicie sua Jornada!
                </h2>
                <p className="text-sm leading-relaxed text-[#888888]">
                  Defina seu investimento mensal e a IA vai montar uma jornada
                  personalizada para o seu negocio.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="investment"
                    className="text-sm font-medium text-[#c0c0c0]"
                  >
                    Investimento mensal disponivel (R$)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#888888]" />
                    <Input
                      id="investment"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 500"
                      value={investment}
                      onChange={(e) =>
                        setInvestment(e.target.value.replace(/[^0-9,.]/g, ""))
                      }
                      className="h-12 border-border bg-white/5 pl-10 text-white placeholder:text-[#555] focus-visible:border-primary"
                    />
                  </div>
                  <p className="text-xs text-[#555]">
                    Este valor define quais equipamentos e acoes serao sugeridos
                    na sua jornada.
                  </p>
                </div>

                <Button
                  onClick={handleGenerateLevels}
                  disabled={!investment || isGenerating}
                  className="h-12 w-full gap-2 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Gerando sua jornada...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Comecar Jornada
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
