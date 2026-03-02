"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  MessageSquare,
  Sparkles,
  Users,
  ChevronRight,
  Target,
  Zap,
  Loader2,
  Store,
  Globe,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Award,
  Instagram,
  AlertCircle,
  Rocket,
  CheckCircle2,
  Camera,
  Trophy,
  Crown,
  Gem,
  Medal,
  Flame,
  Star,
  Lock,
  X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { MissionsModal } from "@/components/dashboard/missions-modal";
import { InstagramModal } from "@/components/dashboard/instagram-modal";
import { cn } from "@/lib/utils";

interface StrategyDay {
  id: string;
  day_number: number;
  content_type: string;
  topic: string;
  caption_idea: string;
  best_time: string;
  hashtags: string;
  completed?: boolean;
  posts?: any[];
}

interface Strategy {
  id: string;
  title: string;
  month: number;
  year: number;
  summary: string;
  strategy_days: StrategyDay[];
}

interface Business {
  id: string;
  business_name: string;
  niche: string;
  main_goal: string;
  platforms: string;
  target_audience: string;
  growth_speed: string;
  responsible_name: string | null;
  instagram_handle: string | null;
  brand_description?: string;
  unique_value?: string;
}

interface DashboardHomeProps {
  profile: { full_name: string | null } | null;
  business: Business | null;
  latestStrategy: Strategy | null;
}

// Função para calcular streak de dias consecutivos
function calculateStreak(days: StrategyDay[]): number {
  const today = new Date().getDate();
  let streak = 0;

  for (let i = today; i >= 1; i--) {
    const day = days.find((d) => d.day_number === i);
    if (!day) continue;

    const hasCompletedPosts =
      day.posts?.some((p) => p.completed) || day.completed || false;

    if (hasCompletedPosts) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Função para contar conquistas
function countAchievements(
  completedPosts: number,
  streak: number,
  progress: number,
  business: Business | null,
): number {
  let count = 0;

  // Conquistas de streak
  if (streak >= 1) count++; // Iniciante
  if (streak >= 2) count++; // Bronze
  if (streak >= 4) count++; // Prata
  if (streak >= 8) count++; // Ouro
  if (streak >= 16) count++; // Platina
  if (streak >= 32) count++; // Diamante
  if (streak >= 64) count++; // Mestre

  // Conquistas de posts
  if (completedPosts >= 1) count++; // Primeiro Post
  if (completedPosts >= 5) count++; // 5 Missões
  if (completedPosts >= 10) count++; // 10 Missões
  if (completedPosts >= 20) count++; // 20 Missões
  if (completedPosts >= 30) count++; // 30 Missões
  if (completedPosts >= 50) count++; // 50 Missões

  // Conquistas de progresso
  if (progress >= 25) count++; // 25%
  if (progress >= 50) count++; // Meio Caminho
  if (progress >= 75) count++; // 75%
  if (progress >= 100) count++; // Mês Perfeito

  // Conquistas de configuração
  if (business?.instagram_handle && business.instagram_handle.length > 0)
    count++; // Conectado
  if (business?.responsible_name && business.responsible_name.length > 0)
    count++; // Perfil Completo

  return count;
}

// Cores do foguete baseado na streak
const getRocketColor = (streak: number) => {
  if (streak >= 64) return "text-purple-600";
  if (streak >= 32) return "text-blue-500";
  if (streak >= 16) return "text-green-500";
  if (streak >= 8) return "text-yellow-500";
  if (streak >= 4) return "text-orange-500";
  if (streak >= 2) return "text-primary";
  if (streak >= 1) return "text-primary";
  return "text-gray-500";
};

// Interface para conquistas
interface Achievement {
  id: string;
  emoji: string;
  icon?: any;
  title: string;
  description: string;
  condition: boolean; // AGORA É SEMPRE BOOLEAN
  rarity: "common" | "rare" | "epic" | "legendary";
  progress?: number;
  max?: number;
}

export function DashboardHome({
  profile,
  business,
  latestStrategy,
}: DashboardHomeProps) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const supabase = createClient();

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar estratégia");

      window.location.reload();
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setGenerating(false);
    }
  };

  const firstName =
    business?.responsible_name?.split(" ")[0] ||
    profile?.full_name?.split(" ")[0] ||
    "Usuário";

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const isCurrentMonthStrategy =
    latestStrategy?.month === currentMonth &&
    latestStrategy?.year === currentYear;

  const strategyDays = latestStrategy?.strategy_days ?? [];

  let totalPosts = 0;
  let completedPosts = 0;

  strategyDays.forEach((day) => {
    if (day.posts && day.posts.length > 0) {
      totalPosts += day.posts.length;
      completedPosts += day.posts.filter((p) => p.completed).length;
    } else if (day.completed !== undefined) {
      totalPosts += 1;
      if (day.completed) completedPosts += 1;
    }
  });

  const progress =
    totalPosts > 0 ? Math.round((completedPosts / totalPosts) * 100) : 0;
  const streak = calculateStreak(strategyDays);

  // Contar conquistas desbloqueadas
  const achievementsCount = countAchievements(
    completedPosts,
    streak,
    progress,
    business,
  );

  const summaryText = latestStrategy?.summary || "";
  const summaryPreview = summaryText.split(".").slice(0, 2).join(".") + ".";
  const hasMoreSummary = summaryText.split(".").length > 2;

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Calcular próximo marco
  const nextMilestone = () => {
    if (streak < 2)
      return { target: 2, current: streak, label: "Bronze", emoji: "🥉" };
    if (streak < 4)
      return { target: 4, current: streak, label: "Prata", emoji: "🥈" };
    if (streak < 8)
      return { target: 8, current: streak, label: "Ouro", emoji: "🥇" };
    if (streak < 16)
      return { target: 16, current: streak, label: "Platina", emoji: "💎" };
    if (streak < 32)
      return { target: 32, current: streak, label: "Diamante", emoji: "💎" };
    if (streak < 64)
      return { target: 64, current: streak, label: "Mestre", emoji: "👑" };
    return { target: 100, current: streak, label: "Lendário", emoji: "🌟" };
  };

  const milestone = nextMilestone();
  const milestoneProgress = (milestone.current / milestone.target) * 100;

  // Conquistas recentes (para preview) - TODAS COM CONDITION BOOLEAN
  const achievements: Achievement[] = [
    {
      id: "streak_1",
      emoji: "🚀",
      icon: Rocket,
      title: "Iniciante",
      description: "1 dia de sequência",
      condition: streak >= 1, // BOOLEAN
      rarity: "common",
    },
    {
      id: "streak_2",
      emoji: "🚀",
      icon: Rocket,
      title: "Bronze",
      description: "2 dias de sequência",
      condition: streak >= 2, // BOOLEAN
      rarity: "common",
    },
    {
      id: "streak_4",
      emoji: "🚀",
      icon: Rocket,
      title: "Prata",
      description: "4 dias de sequência",
      condition: streak >= 4, // BOOLEAN
      rarity: "rare",
    },
    {
      id: "streak_8",
      emoji: "🚀",
      icon: Rocket,
      title: "Ouro",
      description: "8 dias de sequência",
      condition: streak >= 8, // BOOLEAN
      rarity: "rare",
    },
    {
      id: "streak_16",
      emoji: "🚀",
      icon: Rocket,
      title: "Platina",
      description: "16 dias de sequência",
      condition: streak >= 16, // BOOLEAN
      rarity: "epic",
    },
    {
      id: "streak_32",
      emoji: "🚀",
      icon: Rocket,
      title: "Diamante",
      description: "32 dias de sequência",
      condition: streak >= 32, // BOOLEAN
      rarity: "epic",
    },
    {
      id: "streak_64",
      emoji: "👑",
      icon: Crown,
      title: "Mestre",
      description: "64 dias de sequência",
      condition: streak >= 64, // BOOLEAN
      rarity: "legendary",
    },
    {
      id: "first_post",
      emoji: "📱",
      icon: Camera,
      title: "Primeiro Post",
      description: "Complete seu primeiro post",
      condition: completedPosts >= 1, // BOOLEAN
      rarity: "common",
    },
    {
      id: "five_posts",
      emoji: "🎯",
      icon: Target,
      title: "5 Missões",
      description: "Complete 5 posts",
      condition: completedPosts >= 5, // BOOLEAN
      rarity: "common",
    },
    {
      id: "ten_posts",
      emoji: "🏆",
      icon: Trophy,
      title: "10 Missões",
      description: "Complete 10 posts",
      condition: completedPosts >= 10, // BOOLEAN
      rarity: "rare",
    },
    {
      id: "twenty_posts",
      emoji: "👑",
      icon: Crown,
      title: "20 Missões",
      description: "Complete 20 posts",
      condition: completedPosts >= 20, // BOOLEAN
      rarity: "epic",
    },
    {
      id: "half_progress",
      emoji: "🌓",
      icon: Medal,
      title: "Meio Caminho",
      description: "Complete 50% das missões",
      condition: progress >= 50, // BOOLEAN
      rarity: "rare",
    },
    {
      id: "all_posts",
      emoji: "💎",
      icon: Gem,
      title: "Mês Perfeito",
      description: "Complete 100% das missões",
      condition: progress >= 100, // BOOLEAN
      rarity: "legendary",
    },
    {
      id: "instagram",
      emoji: "📸",
      icon: Instagram,
      title: "Conectado",
      description: "Conecte sua conta do Instagram",
      condition: business?.instagram_handle
        ? business.instagram_handle.length > 0
        : false, // BOOLEAN GARANTIDO
      rarity: "rare",
    },
  ];

  const recentAchievements = achievements
    .filter((a) => a.condition)
    .slice(0, 3);

  const getMainGoalLabel = (goal: string) => {
    const goals: Record<string, string> = {
      engajamento: "🔥 Aumentar engajamento",
      seguidores: "📈 Ganhar seguidores",
      vendas: "💰 Aumentar vendas",
      autoridade: "👑 Construir autoridade",
      leads: "🎯 Gerar leads",
    };
    return goals[goal] || goal;
  };

  const getPlatformsLabel = (platforms: string) => {
    const platformMap: Record<string, string> = {
      instagram: "📱 Instagram",
      tiktok: "🎵 TikTok",
      instagram_tiktok: "📱 + 🎵 Instagram e TikTok",
      todas: "🌐 Todas as redes",
    };
    return platformMap[platforms] || platforms;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      {/* Header com streak e botão de conquistas */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao seu painel de marketing inteligente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Conquistas */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMissionsModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2 hover:shadow-lg transition-all"
          >
            <Award className="size-5 text-yellow-500" />
            <span className="font-bold text-sm text-yellow-500">
              {achievementsCount}
            </span>
            <span className="text-xs text-muted-foreground">conquistas</span>
          </motion.button>

          {/* Streak badge - com ícone de foguete */}
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <Rocket
              className={cn("size-5 transition-colors", getRocketColor(streak))}
            />
            <span className="font-bold text-sm text-primary">{streak}</span>
            <span className="text-xs text-muted-foreground">dias</span>
          </div>
        </div>
      </motion.div>

      {/* Card de informações do negócio */}
      {business && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden rounded-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-4 flex-col md:flex-row">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <Store className="size-8 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {business.business_name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.niche} •{" "}
                        {business.growth_speed === "rapido" &&
                          "🚀 Rápido (posto todo dia)"}
                        {business.growth_speed === "moderado" &&
                          "⚡ Moderado (dias alternados)"}
                        {business.growth_speed === "leve" &&
                          "🌱 Leve (2-3x por semana)"}
                      </p>
                    </div>

                    {business.instagram_handle ? (
                      <a
                        href={`https://instagram.com/${business.instagram_handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors"
                      >
                        <Instagram className="size-4 text-primary" />@
                        {business.instagram_handle.replace("@", "")}
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowInstagramModal(true)}
                        className="flex items-center gap-2 rounded-xl border border-yellow-500/20 px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-500/10 transition-colors"
                      >
                        <AlertCircle className="size-4" />
                        Adicionar Instagram
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Target className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Objetivo
                        </p>
                        <p className="text-sm font-medium">
                          {getMainGoalLabel(business.main_goal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Globe className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Plataformas
                        </p>
                        <p className="text-sm font-medium">
                          {getPlatformsLabel(business.platforms)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Users className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Público</p>
                        <p className="text-sm font-medium line-clamp-1">
                          {business.target_audience
                            .split(" ")
                            .slice(0, 5)
                            .join(" ")}
                          {business.target_audience.split(" ").length > 5
                            ? "..."
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cards de estatísticas - 4 cards com gamificação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 scale-150" />
              <CheckCircle2 className="size-6 text-primary relative z-10" />
            </div>
            <span className="text-2xl font-bold text-primary">
              {completedPosts}
            </span>
            <span className="text-xs text-muted-foreground">Missões</span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-30 scale-150" />
              <Flame className="size-6 text-yellow-500 relative z-10" />
            </div>
            <span className="text-2xl font-bold text-yellow-500">{streak}</span>
            <span className="text-xs text-muted-foreground">Sequência</span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-30 scale-150" />
              <TrendingUp className="size-6 text-green-500 relative z-10" />
            </div>
            <span className="text-2xl font-bold text-green-500">
              {progress}%
            </span>
            <span className="text-xs text-muted-foreground">Progresso</span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 scale-150" />
              <Award className="size-6 text-blue-500 relative z-10" />
            </div>
            <span className="text-2xl font-bold text-blue-500">
              {achievementsCount}
            </span>
            <span className="text-xs text-muted-foreground">Conquistas</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximos Marcos - NOVO CARD */}
      {latestStrategy && isCurrentMonthStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  Próximo Marco: {milestone.emoji} {milestone.label}
                </h3>
                <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full">
                  {milestone.current}/{milestone.target} dias
                </Badge>
              </div>
              <Progress value={milestoneProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete mais {milestone.target - milestone.current} dia(s) para
                desbloquear!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conquistas Recentes - NOVO CARD */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap gap-2"
        >
          {recentAchievements.map((achievement) => (
            <button
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30",
              )}
            >
              <span className="text-lg">{achievement.emoji}</span>
              <span className="text-xs font-medium">{achievement.title}</span>
              <CheckCircle2 className="size-3 text-green-500" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Card de Estratégia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary" />
              {latestStrategy
                ? `Estratégia de ${today.toLocaleString("pt-BR", { month: "long" })}`
                : "Sua Estratégia"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestStrategy ? (
              <>
                {!isCurrentMonthStrategy && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500/30 bg-yellow-500/10 text-yellow-600 mb-4 rounded-full"
                  >
                    Mês anterior
                  </Badge>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {expandedSummary ? summaryText : summaryPreview}
                  </p>

                  {hasMoreSummary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSummary(!expandedSummary)}
                      className="text-primary hover:text-primary/80 p-0 h-auto rounded-full"
                    >
                      {expandedSummary ? (
                        <>
                          Ver menos <ChevronUp className="size-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Continuar lendo{" "}
                          <ChevronDown className="size-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isCurrentMonthStrategy && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso do mês</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    asChild
                    className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl"
                  >
                    <Link href="/dashboard/calendar">
                      <CalendarDays className="size-4" />
                      Ver Calendário Completo
                      <ChevronRight className="size-4 ml-auto" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="size-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Nenhuma estratégia ativa
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Gere sua primeira estratégia para começar a postar conteúdo
                    personalizado!
                  </p>
                </div>

                {genError && (
                  <Badge variant="destructive" className="text-xs rounded-full">
                    {genError}
                  </Badge>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600 rounded-xl px-6 py-5"
                >
                  {generating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Gerando estratégia...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Gerar Estratégia do Mês
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximos Dias */}
      {latestStrategy && isCurrentMonthStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-primary/10 bg-card rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="size-5 text-primary" />
                Próximos Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {strategyDays
                  .filter((day) => day.day_number >= today.getDate())
                  .slice(0, 5)
                  .map((day) => {
                    const posts = day.posts || [];
                    const hasPosts = posts.length > 0;
                    const completedCount = posts.filter(
                      (p) => p.completed,
                    ).length;

                    return (
                      <Link
                        key={day.id}
                        href="/dashboard/calendar"
                        className="group rounded-xl border border-primary/10 bg-gradient-to-br from-secondary/30 to-transparent p-4 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-primary">
                            Dia {day.day_number}
                          </p>
                          {completedCount > 0 && (
                            <Badge className="bg-green-500/20 text-green-500 text-[10px] rounded-full px-2">
                              {completedCount}/{posts.length}
                            </Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground">
                          {day.topic || `${posts.length} conteúdos`}
                        </p>
                        {hasPosts && (
                          <div className="flex gap-1 mt-2">
                            {posts.slice(0, 3).map((post, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  post.completed
                                    ? "bg-green-500"
                                    : "bg-primary",
                                )}
                              />
                            ))}
                            {posts.length > 3 && (
                              <span className="text-[8px] text-muted-foreground">
                                +{posts.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Card do Assistente IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="size-5 text-primary" />
              Assistente IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-secondary/50 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cresci.IA</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Olá! Sou sua assistente. Posso ajudar com ideias de
                    conteúdo, dúvidas de marketing e muito mais!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Sugestões rápidas:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ideia para Reels hoje",
                  "O que postar amanhã?",
                  "Melhor horário",
                  "Ideias de conteúdo",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-primary/20 hover:bg-primary/10 rounded-full"
                    asChild
                  >
                    <Link
                      href={`/dashboard/chat?q=${encodeURIComponent(suggestion)}`}
                    >
                      {suggestion}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              asChild
              className="w-full gap-2 bg-primary hover:bg-primary/90 mt-4 rounded-xl"
            >
              <Link href="/dashboard/chat">
                Conversar com a IA
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <MissionsModal
        open={showMissionsModal}
        onOpenChange={setShowMissionsModal}
        business={business}
        completedPosts={completedPosts}
        totalPosts={totalPosts}
        streak={streak}
        progress={progress}
      />

      <InstagramModal
        open={showInstagramModal}
        onOpenChange={setShowInstagramModal}
        business={business}
      />

      {/* Modal de detalhes da conquista */}
      <AnimatePresence>
        {selectedAchievement && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
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
              className="relative z-10 w-full max-w-sm rounded-2xl bg-card border-2 border-primary/20 p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  "inline-block p-4 rounded-2xl mb-4 bg-gradient-to-br",
                  selectedAchievement.rarity === "common" &&
                    "from-gray-500/20 to-gray-600/20",
                  selectedAchievement.rarity === "rare" &&
                    "from-blue-500/20 to-cyan-500/20",
                  selectedAchievement.rarity === "epic" &&
                    "from-purple-500/20 to-pink-500/20",
                  selectedAchievement.rarity === "legendary" &&
                    "from-yellow-500/20 to-orange-500/20",
                )}
              >
                <span className="text-5xl sm:text-6xl">
                  {selectedAchievement.emoji}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                {selectedAchievement.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {selectedAchievement.description}
              </p>

              <Badge
                className={cn(
                  "mb-4 rounded-full px-4 py-1 text-xs",
                  selectedAchievement.rarity === "common" &&
                    "bg-gray-500/20 text-gray-500 border-gray-500/30",
                  selectedAchievement.rarity === "rare" &&
                    "bg-blue-500/20 text-blue-500 border-blue-500/30",
                  selectedAchievement.rarity === "epic" &&
                    "bg-purple-500/20 text-purple-500 border-purple-500/30",
                  selectedAchievement.rarity === "legendary" &&
                    "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
                )}
              >
                {selectedAchievement.rarity === "common" && "Comum"}
                {selectedAchievement.rarity === "rare" && "Raro ⭐"}
                {selectedAchievement.rarity === "epic" && "Épico 💫"}
                {selectedAchievement.rarity === "legendary" && "Lendário 👑"}
              </Badge>

              {selectedAchievement.condition ? (
                <div className="flex items-center justify-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl mb-4">
                  <CheckCircle2 className="size-4 sm:size-5" />
                  <span className="font-medium text-sm sm:text-base">
                    Conquista Desbloqueada!
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground bg-gray-500/10 p-3 rounded-xl mb-4">
                  <Lock className="size-4 sm:size-5" />
                  <span className="font-medium text-sm sm:text-base">
                    Ainda bloqueada
                  </span>
                </div>
              )}

              {/* Botão de fechar - ÚNICO BOTÃO */}
              <Button
                onClick={() => setSelectedAchievement(null)}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white gap-2"
              >
                Fechar
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
