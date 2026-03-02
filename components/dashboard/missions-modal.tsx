"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Flame,
  Award,
  CheckCircle2,
  X,
  Star,
  Zap,
  Rocket,
  Crown,
  Medal,
  Sparkles,
  Trophy,
  Gem,
  Camera,
  Users,
  Lock,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: any;
  completedPosts: number;
  totalPosts: number;
  streak: number;
  progress: number;
}

interface Achievement {
  id: string;
  emoji: string;
  icon?: any;
  title: string;
  description: string;
  condition: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

const rarityColors = {
  common: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
  rare: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  epic: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  legendary: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
};

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

export function MissionsModal({
  open,
  onOpenChange,
  business,
  completedPosts,
  totalPosts,
  streak,
  progress,
}: MissionsModalProps) {
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [modalStack, setModalStack] = useState<Achievement[]>([]);

  // Gerenciar pilha de modais
  useEffect(() => {
    if (selectedAchievement) {
      // Verificar se já não está na pilha
      const exists = modalStack.some((a) => a.id === selectedAchievement.id);
      if (!exists) {
        setModalStack((prev) => [...prev, selectedAchievement]);
      }
    }
  }, [selectedAchievement, modalStack]);

  const handleCloseTopModal = () => {
    setModalStack((prev) => {
      const newStack = [...prev];
      newStack.pop(); // Remove o último (topo da pilha)

      if (newStack.length === 0) {
        setSelectedAchievement(null);
      } else {
        setSelectedAchievement(newStack[newStack.length - 1]);
      }

      return newStack;
    });
  };

  const handleCloseAllModals = () => {
    setModalStack([]);
    setSelectedAchievement(null);
  };

  // Missão principal baseada na frequência
  const getMainMission = () => {
    if (business?.growth_speed === "rapido") {
      return {
        title: "🚀 Desafio Diário",
        description: "Poste todos os dias deste mês!",
        target: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
        ).getDate(),
        emoji: "🚀",
        current: completedPosts,
      };
    } else if (business?.growth_speed === "moderado") {
      return {
        title: "⚡ Consistência",
        description: "Complete 15 posts no mês",
        target: 15,
        emoji: "⚡",
        current: completedPosts,
      };
    } else {
      return {
        title: "🌱 Crescimento Leve",
        description: "Complete 8 posts no mês",
        target: 8,
        emoji: "🌱",
        current: completedPosts,
      };
    }
  };

  // Todas as conquistas disponíveis - IDs ÚNICOS
  const achievements: Achievement[] = [
    // Conquistas de Streak
    {
      id: "streak_1",
      emoji: "🚀",
      icon: Rocket,
      title: "Iniciante",
      description: "1 dia de sequência",
      condition: streak >= 1,
      rarity: "common",
    },
    {
      id: "streak_2",
      emoji: "🚀",
      icon: Rocket,
      title: "Bronze",
      description: "2 dias de sequência",
      condition: streak >= 2,
      rarity: "common",
    },
    {
      id: "streak_4",
      emoji: "🚀",
      icon: Rocket,
      title: "Prata",
      description: "4 dias de sequência",
      condition: streak >= 4,
      rarity: "rare",
    },
    {
      id: "streak_8",
      emoji: "🚀",
      icon: Rocket,
      title: "Ouro",
      description: "8 dias de sequência",
      condition: streak >= 8,
      rarity: "rare",
    },
    {
      id: "streak_16",
      emoji: "🚀",
      icon: Rocket,
      title: "Platina",
      description: "16 dias de sequência",
      condition: streak >= 16,
      rarity: "epic",
    },
    {
      id: "streak_32",
      emoji: "🚀",
      icon: Rocket,
      title: "Diamante",
      description: "32 dias de sequência",
      condition: streak >= 32,
      rarity: "epic",
    },
    {
      id: "streak_64",
      emoji: "👑",
      icon: Crown,
      title: "Mestre",
      description: "64 dias de sequência",
      condition: streak >= 64,
      rarity: "legendary",
    },

    // Conquistas de Posts
    {
      id: "first_post",
      emoji: "📱",
      icon: Camera,
      title: "Primeiro Post",
      description: "Complete seu primeiro post",
      condition: completedPosts >= 1,
      rarity: "common",
    },
    {
      id: "five_posts",
      emoji: "🎯",
      icon: Target,
      title: "5 Missões",
      description: "Complete 5 posts",
      condition: completedPosts >= 5,
      rarity: "common",
    },
    {
      id: "ten_posts",
      emoji: "🏆",
      icon: Trophy,
      title: "10 Missões",
      description: "Complete 10 posts",
      condition: completedPosts >= 10,
      rarity: "rare",
    },
    {
      id: "twenty_posts",
      emoji: "👑",
      icon: Crown,
      title: "20 Missões",
      description: "Complete 20 posts",
      condition: completedPosts >= 20,
      rarity: "epic",
    },
    {
      id: "thirty_posts",
      emoji: "💎",
      icon: Gem,
      title: "30 Missões",
      description: "Complete 30 posts",
      condition: completedPosts >= 30,
      rarity: "epic",
    },
    {
      id: "fifty_posts",
      emoji: "🌟",
      icon: Star,
      title: "50 Missões",
      description: "Complete 50 posts",
      condition: completedPosts >= 50,
      rarity: "legendary",
    },

    // Conquistas de Progresso
    {
      id: "progress_25",
      emoji: "🌓",
      icon: TrendingUp,
      title: "25%",
      description: "Complete 25% das missões",
      condition: progress >= 25,
      rarity: "common",
    },
    {
      id: "half_progress",
      emoji: "🌓",
      icon: Medal,
      title: "Meio Caminho",
      description: "Complete 50% das missões",
      condition: progress >= 50,
      rarity: "rare",
    },
    {
      id: "progress_75",
      emoji: "🌓",
      icon: TrendingUp,
      title: "75%",
      description: "Complete 75% das missões",
      condition: progress >= 75,
      rarity: "epic",
    },
    {
      id: "perfect_month",
      emoji: "💎",
      icon: Gem,
      title: "Mês Perfeito",
      description: "Complete 100% das missões",
      condition: progress >= 100,
      rarity: "legendary",
    },

    // Conquistas de Configuração
    {
      id: "instagram_connected",
      emoji: "📸",
      icon: Camera,
      title: "Conectado",
      description: "Conecte sua conta do Instagram",
      condition: business?.instagram_handle
        ? business.instagram_handle.length > 0
        : false,
      rarity: "rare",
    },
    {
      id: "profile_complete",
      emoji: "👤",
      icon: Users,
      title: "Perfil Completo",
      description: "Preencha todas as informações do perfil",
      condition: business?.responsible_name
        ? business.responsible_name.length > 0
        : false,
      rarity: "common",
    },
  ];

  const mainMission = getMainMission();
  const mainProgress = Math.min(
    (completedPosts / mainMission.target) * 100,
    100,
  );

  // Agrupar conquistas por tipo para exibição
  const streakAchievements = achievements.filter((a) =>
    a.id.includes("streak"),
  );
  const postAchievements = achievements.filter(
    (a) => a.id.includes("posts") || a.id === "first_post",
  );
  const progressAchievements = achievements.filter(
    (a) =>
      a.id.includes("progress") ||
      a.id === "half_progress" ||
      a.id === "perfect_month" ||
      a.id === "progress_25" ||
      a.id === "progress_75",
  );
  const otherAchievements = achievements.filter(
    (a) =>
      !a.id.includes("streak") &&
      !a.id.includes("posts") &&
      !a.id.includes("progress") &&
      a.id !== "first_post" &&
      a.id !== "perfect_month" &&
      a.id !== "half_progress",
  );

  return (
    <>
      {/* Modal Principal de Missões */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Target className="size-5 sm:size-6 text-primary" />
              Missões e Conquistas
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Acompanhe seu progresso e desbloqueie conquistas incríveis
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-8rem)] px-4 sm:px-6 pb-6">
            <Tabs defaultValue="missions" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
                <TabsTrigger
                  value="missions"
                  className="rounded-lg text-xs sm:text-sm"
                >
                  Missões
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="rounded-lg text-xs sm:text-sm"
                >
                  Conquistas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="missions" className="space-y-4">
                {/* Missão Principal */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl bg-primary/20 shrink-0">
                        <span className="text-2xl sm:text-4xl">
                          {mainMission.emoji}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-semibold mb-1">
                          {mainMission.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                          {mainMission.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Progresso</span>
                            <span className="font-medium">
                              {completedPosts}/{mainMission.target}
                            </span>
                          </div>
                          <Progress value={mainProgress} className="h-2" />
                        </div>

                        {completedPosts >= mainMission.target && (
                          <Badge className="mt-3 bg-green-500/20 text-green-500 border-green-500/30 rounded-full px-3 sm:px-4 py-1 text-xs">
                            🏆 Missão Principal Concluída!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak com foguete colorido */}
                <Card className="border border-primary/10 rounded-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-colors",
                          streak === 0 ? "bg-gray-500/10" : "bg-primary/10",
                        )}
                      >
                        <Rocket
                          className={cn(
                            "size-5 sm:size-6",
                            getRocketColor(streak),
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base">
                          Sequência Atual
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Você está postando há {streak}{" "}
                          {streak === 1 ? "dia" : "dias"} seguidos!
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-full px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base",
                          getRocketColor(streak).replace(
                            "text-",
                            "bg-/20 text-",
                          ),
                        )}
                      >
                        🚀 {streak}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Próximos Marcos - COM CORES POR NÍVEL */}
                <Card className="border border-primary/10 rounded-xl">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-sm sm:text-base mb-4">
                      Próximos Marcos
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 4, 8, 16, 32, 64].map((target) => {
                        const isUnlocked = streak >= target;
                        const isNext = !isUnlocked && target > streak;

                        let bgColor = "bg-gray-500";
                        let textColor = "text-gray-500";

                        if (target === 1) {
                          bgColor = "bg-primary";
                          textColor = "text-primary";
                        } else if (target === 2) {
                          bgColor = "bg-orange-500";
                          textColor = "text-orange-500";
                        } else if (target === 4) {
                          bgColor = "bg-yellow-500";
                          textColor = "text-yellow-500";
                        } else if (target === 8) {
                          bgColor = "bg-green-500";
                          textColor = "text-green-500";
                        } else if (target === 16) {
                          bgColor = "bg-blue-500";
                          textColor = "text-blue-500";
                        } else if (target === 32) {
                          bgColor = "bg-purple-500";
                          textColor = "text-purple-500";
                        } else if (target === 64) {
                          bgColor = "bg-pink-600";
                          textColor = "text-pink-600";
                        }

                        return (
                          <div key={target} className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                isUnlocked ? bgColor : "bg-gray-500",
                              )}
                            />
                            <span className="flex-1 text-xs sm:text-sm">
                              {target} {target === 1 ? "dia" : "dias"} de
                              sequência
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full text-xs",
                                isUnlocked &&
                                  `${textColor} border-${textColor.replace("text-", "")}/30 bg-${textColor.replace("text-", "")}/10`,
                                isNext &&
                                  "border-primary/30 bg-primary/10 text-primary",
                              )}
                            >
                              {isUnlocked ? (
                                <CheckCircle2 className="size-3 mr-1" />
                              ) : isNext ? (
                                `${streak}/${target}`
                              ) : (
                                `${streak}/${target}`
                              )}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                {/* Conquistas de Sequência */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Rocket className="size-4 text-primary" />
                    Conquistas de Sequência
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {streakAchievements.map((achievement) => {
                      const isUnlocked = achievement.condition;
                      return (
                        <motion.button
                          key={achievement.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedAchievement(achievement)}
                          className={cn(
                            "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border-2 transition-all",
                            isUnlocked
                              ? cn(
                                  "bg-gradient-to-br",
                                  achievement.id === "streak_1" &&
                                    "from-primary/20 to-primary/10 border-primary/30",
                                  achievement.id === "streak_2" &&
                                    "from-orange-500/20 to-orange-600/10 border-orange-500/30",
                                  achievement.id === "streak_4" &&
                                    "from-yellow-500/20 to-orange-500/10 border-yellow-500/30",
                                  achievement.id === "streak_8" &&
                                    "from-green-500/20 to-emerald-500/10 border-green-500/30",
                                  achievement.id === "streak_16" &&
                                    "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
                                  achievement.id === "streak_32" &&
                                    "from-purple-500/20 to-pink-500/10 border-purple-500/30",
                                  achievement.id === "streak_64" &&
                                    "from-pink-500/20 to-rose-500/10 border-pink-500/30",
                                )
                              : "border-gray-700/30 grayscale opacity-40 hover:opacity-60",
                          )}
                        >
                          <span className="text-2xl sm:text-3xl">
                            {achievement.emoji}
                          </span>
                          <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                            {achievement.title}
                          </span>
                          {isUnlocked && (
                            <CheckCircle2 className="size-3 sm:size-4 text-green-500" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Conquistas de Missões */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="size-4 text-primary" />
                    Conquistas de Missões
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {postAchievements.map((achievement) => (
                      <motion.button
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAchievement(achievement)}
                        className={cn(
                          "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border-2 transition-all",
                          achievement.condition
                            ? cn(
                                "bg-gradient-to-br",
                                achievement.id === "first_post" &&
                                  "from-primary/20 to-purple-600/10 border-primary/30",
                                achievement.id === "five_posts" &&
                                  "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
                                achievement.id === "ten_posts" &&
                                  "from-green-500/20 to-emerald-500/10 border-green-500/30",
                                achievement.id === "twenty_posts" &&
                                  "from-yellow-500/20 to-orange-500/10 border-yellow-500/30",
                                achievement.id === "thirty_posts" &&
                                  "from-orange-500/20 to-red-500/10 border-orange-500/30",
                                achievement.id === "fifty_posts" &&
                                  "from-purple-500/20 to-pink-500/10 border-purple-500/30",
                              )
                            : "border-gray-700/30 grayscale opacity-40 hover:opacity-60",
                        )}
                      >
                        <span className="text-2xl sm:text-3xl">
                          {achievement.emoji}
                        </span>
                        <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                          {achievement.title}
                        </span>
                        {achievement.condition && (
                          <CheckCircle2 className="size-3 sm:size-4 text-green-500" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Conquistas de Progresso */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    Conquistas de Progresso
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {progressAchievements.map((achievement) => (
                      <motion.button
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAchievement(achievement)}
                        className={cn(
                          "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border-2 transition-all",
                          achievement.condition
                            ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30"
                            : "border-gray-700/30 grayscale opacity-40 hover:opacity-60",
                        )}
                      >
                        <span className="text-2xl sm:text-3xl">
                          {achievement.emoji}
                        </span>
                        <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                          {achievement.title}
                        </span>
                        {achievement.condition && (
                          <CheckCircle2 className="size-3 sm:size-4 text-green-500" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Outras Conquistas */}
                {otherAchievements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Award className="size-4 text-primary" />
                      Outras Conquistas
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {otherAchievements.map((achievement) => (
                        <motion.button
                          key={achievement.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedAchievement(achievement)}
                          className={cn(
                            "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border-2 transition-all",
                            achievement.condition
                              ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30"
                              : "border-gray-700/30 grayscale opacity-40 hover:opacity-60",
                          )}
                        >
                          <span className="text-2xl sm:text-3xl">
                            {achievement.emoji}
                          </span>
                          <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                            {achievement.title}
                          </span>
                          {achievement.condition && (
                            <CheckCircle2 className="size-3 sm:size-4 text-green-500" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modais de detalhes das conquistas - em pilha */}
      <AnimatePresence>
        {modalStack.map((achievement, index) => (
          <div
            key={achievement.id}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ zIndex: 70 + index }}
            onClick={handleCloseTopModal}
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
              transition={{ delay: index * 0.05 }}
              className="relative z-10 w-full max-w-sm rounded-2xl bg-card border-2 border-primary/20 p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  "inline-block p-4 rounded-2xl mb-4 bg-gradient-to-br",
                  achievement.rarity === "common" &&
                    "from-gray-500/20 to-gray-600/20",
                  achievement.rarity === "rare" &&
                    "from-blue-500/20 to-cyan-500/20",
                  achievement.rarity === "epic" &&
                    "from-purple-500/20 to-pink-500/20",
                  achievement.rarity === "legendary" &&
                    "from-yellow-500/20 to-orange-500/20",
                )}
              >
                <span className="text-5xl sm:text-6xl">
                  {achievement.emoji}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                {achievement.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {achievement.description}
              </p>

              <Badge
                className={cn(
                  "mb-4 rounded-full px-4 py-1 text-xs",
                  achievement.rarity === "common" &&
                    "bg-gray-500/20 text-gray-500 border-gray-500/30",
                  achievement.rarity === "rare" &&
                    "bg-blue-500/20 text-blue-500 border-blue-500/30",
                  achievement.rarity === "epic" &&
                    "bg-purple-500/20 text-purple-500 border-purple-500/30",
                  achievement.rarity === "legendary" &&
                    "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
                )}
              >
                {achievement.rarity === "common" && "Comum"}
                {achievement.rarity === "rare" && "Raro ⭐"}
                {achievement.rarity === "epic" && "Épico 💫"}
                {achievement.rarity === "legendary" && "Lendário 👑"}
              </Badge>

              {achievement.condition ? (
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

              {/* Botão de fechar - FECHA APENAS O MODAL DO TOPO */}
              <Button
                onClick={handleCloseTopModal}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white gap-2"
              >
                Fechar
              </Button>

              {/* Indicador de pilha (se houver mais modais abaixo) */}
              {index < modalStack.length - 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{modalStack.length - index - 1} conquista(s) na pilha
                </p>
              )}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </>
  );
}
