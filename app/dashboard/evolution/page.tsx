"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  CheckCircle2,
  Sparkles,
  X,
  Loader2,
  Rocket,
  Target,
  Zap,
  Camera,
  DollarSign,
  ExternalLink,
  Trophy,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Level {
  id: string;
  level_number: number;
  title: string;
  type: "equipment" | "goal" | "action";
  description: string;
  tip: string;
  estimated_cost: number;
  expected_result: string;
  status: "locked" | "available" | "completed";
}

export default function EvolutionPage() {
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [investment, setInvestment] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [updatingLevel, setUpdatingLevel] = useState<string | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      const { data: evolution } = await supabase
        .from("evolution_data")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .maybeSingle();

      setEvolutionData(evolution);

      if (evolution) {
        const { data: levelsData } = await supabase
          .from("evolution_levels")
          .select("*")
          .eq("user_id", user.id)
          .eq("month", now.getMonth() + 1)
          .eq("year", now.getFullYear())
          .order("level_number", { ascending: true });

        if (levelsData && levelsData.length > 0) {
          setLevels(levelsData);
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
    if (!investment || Number(investment) <= 0) return;

    setIsGenerating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      await supabase.from("evolution_data").upsert({
        user_id: user.id,
        business_id: business.id,
        current_followers: evolutionData?.current_followers || 0,
        current_stories_views: evolutionData?.current_stories_views || 0,
        monthly_investment: Number(investment),
        month,
        year,
      });

      const res = await fetch("/api/generate-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investment_amount: Number(investment),
          business,
          month_number: 1,
          current_followers: evolutionData?.current_followers || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLevels(data.levels);
      setShowInitialModal(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#D946EF", "#F97316"],
      });
    } catch (error: any) {
      console.error("Erro ao gerar níveis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteLevel = async (level: Level) => {
    setUpdatingLevel(level.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      await supabase
        .from("evolution_levels")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", level.id);

      setLevels((prev) =>
        prev.map((l) =>
          l.id === level.id ? { ...l, status: "completed" } : l,
        ),
      );

      // Desbloquear próximo nível
      const nextLevel = levels.find(
        (l) => l.level_number === level.level_number + 1,
      );
      if (nextLevel) {
        await supabase
          .from("evolution_levels")
          .update({ status: "available" })
          .eq("id", nextLevel.id);

        setLevels((prev) =>
          prev.map((l) =>
            l.id === nextLevel.id ? { ...l, status: "available" } : l,
          ),
        );
      }

      // Confetti de conquista
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#10B981", "#FBBF24"],
      });

      setSelectedLevel(null);
    } catch (error) {
      console.error("Erro ao completar nível:", error);
    } finally {
      setUpdatingLevel(null);
    }
  };

  const handleSearchProduct = (title: string, type: string) => {
    let searchQuery = title;

    if (type === "equipment") {
      if (title.toLowerCase().includes("softbox")) {
        searchQuery = "softbox quadrado mini para fotografia de produtos";
      } else if (title.toLowerCase().includes("câmera")) {
        searchQuery = "câmera para fotografia de produtos";
      } else if (title.toLowerCase().includes("microfone")) {
        searchQuery = "microfone lapela para vídeos";
      } else if (title.toLowerCase().includes("iluminação")) {
        searchQuery = "kit iluminação para fotografia de produtos";
      }
    }

    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
      "_blank",
    );
  };

  const completedCount = levels.filter((l) => l.status === "completed").length;
  const totalCount = levels.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getLevelIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Camera className="size-5" />;
      case "goal":
        return <Target className="size-5" />;
      case "action":
        return <Zap className="size-5" />;
      default:
        return <Trophy className="size-5" />;
    }
  };

  // LINHA RETA VERTICAL - Posições centralizadas
  const generateVerticalPositions = (count: number) => {
    const positions = [];
    const centerX = 50; // Centralizado (50%)
    const startY = 15; // Começa em 15%
    const stepY = 12; // Espaçamento entre níveis

    for (let i = 0; i < count; i++) {
      positions.push({
        x: centerX,
        y: startY + i * stepY,
      });
    }

    return positions;
  };

  // Função para criar linha reta vertical
  const createVerticalPath = (positions: { x: number; y: number }[]) => {
    if (positions.length < 2) return "";

    let path = `M ${positions[0].x},${positions[0].y}`;

    for (let i = 1; i < positions.length; i++) {
      path += ` L ${positions[i].x},${positions[i].y}`;
    }

    return path;
  };

  // Gerar posições verticais
  const levelPositions = generateVerticalPositions(levels.length);
  const pathD = createVerticalPath(levelPositions);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Jornada de Evolução
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <HelpCircle className="size-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Complete os níveis em ordem para evoluir! Cada nível concluído
                  desbloqueia o próximo.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Progress Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-xl">
            <CardContent className="py-3 px-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {completedCount}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-24 h-2" />
                    <span className="text-sm font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm"
            >
              <p className="text-foreground">
                <span className="font-bold text-primary">Como funciona:</span>{" "}
                Siga a linha vertical para completar sua jornada! Nível 1
                disponível, complete para desbloquear o próximo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mapa de evolução - LINHA RETA VERTICAL */}
        <div className="relative w-full min-h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 p-8">
          {/* Container SVG para a linha reta vertical */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={pathD}
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              strokeLinecap="round"
              className="opacity-70"
            />
          </svg>

          {/* Níveis em linha reta vertical */}
          {levels.map((level, index) => {
            const pos = levelPositions[index];
            if (!pos) return null;

            const isCompleted = level.status === "completed";
            const isAvailable = level.status === "available";
            const isFirst = index === 0;
            const canClick = isFirst ? true : isAvailable;

            // Determinar cor baseada no status
            let borderColor = "border-gray-600";
            let bgColor = "bg-gray-800";
            let textColor = "text-gray-400";

            if (isCompleted) {
              borderColor = "border-white";
              bgColor = "bg-primary";
              textColor = "text-white";
            } else if (isAvailable || isFirst) {
              borderColor = "border-white";
              bgColor = "bg-primary";
              textColor = "text-white";
            }

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Bolinha do nível */}
                <motion.button
                  whileHover={canClick ? { scale: 1.15 } : {}}
                  whileTap={canClick ? { scale: 0.95 } : {}}
                  onClick={() => canClick && setSelectedLevel(level)}
                  disabled={!canClick}
                  className={cn(
                    "relative w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold transition-all shadow-lg",
                    borderColor,
                    bgColor,
                    textColor,
                    !canClick &&
                      !isCompleted &&
                      "cursor-not-allowed opacity-70",
                  )}
                >
                  {level.level_number}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle2 className="size-5 text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                  {!isCompleted && !isAvailable && !isFirst && (
                    <Lock className="absolute size-4 text-gray-400" />
                  )}
                </motion.button>

                {/* Título do nível */}
                <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 whitespace-nowrap">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {level.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {level.type === "equipment" && "📷 Equipamento"}
                    {level.type === "goal" && "🎯 Meta"}
                    {level.type === "action" && "⚡ Ação"}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Mensagem se não houver níveis */}
          {levels.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">
                Nenhum nível disponível. Gere sua jornada!
              </p>
            </div>
          )}
        </div>

        {/* Modal de desbloqueio */}
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
                className="relative z-10 w-full max-w-md rounded-2xl bg-card border-2 border-primary/20 p-6 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Rocket className="size-16 text-primary" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Inicie sua Jornada!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Defina seu investimento mensal para desbloquear equipamentos
                    e missões
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="investment">Investimento mensal (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="investment"
                        type="number"
                        placeholder="500"
                        value={investment}
                        onChange={(e) => setInvestment(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateLevels}
                    disabled={!investment || isGenerating}
                    className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Começar Jornada
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de detalhes do nível */}
        <AnimatePresence>
          {selectedLevel && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLevel(null)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-lg rounded-xl bg-card border-2 border-primary/20 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        selectedLevel.status === "completed"
                          ? "bg-primary/20"
                          : "bg-primary/10",
                      )}
                    >
                      {getLevelIcon(selectedLevel.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedLevel.title}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        Nível {selectedLevel.level_number}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLevel.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-primary/10">
                      <CardContent className="p-3 text-center">
                        <DollarSign className="size-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Custo</p>
                        <p className="font-medium">
                          R$ {selectedLevel.estimated_cost}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-primary/10">
                      <CardContent className="p-3 text-center">
                        <Target className="size-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Resultado
                        </p>
                        <p className="text-xs font-medium">
                          {selectedLevel.expected_result}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                      <Sparkles className="size-3" />
                      Dica da IA
                    </p>
                    <p className="text-sm">{selectedLevel.tip}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleCompleteLevel(selectedLevel)}
                      disabled={
                        updatingLevel === selectedLevel.id ||
                        selectedLevel.status === "completed"
                      }
                      className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    >
                      {updatingLevel === selectedLevel.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : selectedLevel.status === "completed" ? (
                        <>
                          <CheckCircle2 className="size-4" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          Concluir Missão
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        handleSearchProduct(
                          selectedLevel.title,
                          selectedLevel.type,
                        )
                      }
                      className="gap-2 border-primary/30 hover:bg-primary/10"
                    >
                      <ExternalLink className="size-4" />
                      Ver opções
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
