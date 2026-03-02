"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  Clock,
  Hash,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Film,
  BookOpen,
  Mic,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Users,
  TrendingUp,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import confetti from "canvas-confetti";

interface Post {
  id?: string;
  time: string;
  content_type: string;
  topic: string;
  script: string;
  hashtags: string;
  completed?: boolean;
}

interface StrategyDay {
  id: string;
  day_number: number;
  posts: Post[];
}

interface Strategy {
  id: string;
  title: string;
  month: number;
  year: number;
  summary: string;
  strategy_days: StrategyDay[];
}

const contentTypeIcons: Record<string, any> = {
  Reels: Film,
  Carrossel: BookOpen,
  Stories: Video,
  "Post Estático": ImageIcon,
  Live: Mic,
};

const contentTypeColors: Record<string, string> = {
  Reels:
    "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30",
  Carrossel:
    "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  Stories:
    "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  "Post Estático":
    "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30",
  Live: "bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/30",
};

function getContentColor(type: string): string {
  for (const [key, val] of Object.entries(contentTypeColors)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-500/30";
}

function getContentIcon(type: string) {
  for (const [key, Icon] of Object.entries(contentTypeIcons)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return FileText;
}

function calculateStreak(days: StrategyDay[]): number {
  const today = new Date().getDate();
  let streak = 0;

  for (let i = today; i >= 1; i--) {
    const day = days.find((d) => d.day_number === i);
    if (!day) continue;

    const hasCompletedPosts = day.posts?.some((p) => p.completed) || false;
    if (hasCompletedPosts) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Função para obter cor do foguete baseado na streak
const getRocketColor = (streak: number) => {
  if (streak >= 64) return "text-purple-600";
  if (streak >= 32) return "text-blue-500";
  if (streak >= 16) return "text-green-500";
  if (streak >= 8) return "text-yellow-500";
  if (streak >= 4) return "text-orange-500";
  if (streak >= 2) return "text-primary";
  return "text-gray-500";
};

export function StrategyCalendar({ strategy }: { strategy: Strategy | null }) {
  const [selectedDay, setSelectedDay] = useState<StrategyDay | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [updatingPost, setUpdatingPost] = useState<string | null>(null);
  const [localStrategy, setLocalStrategy] = useState<Strategy | null>(strategy);
  const [currentMonth, setCurrentMonth] = useState<number>(
    strategy?.month || new Date().getMonth() + 1,
  );
  const [currentYear, setCurrentYear] = useState<number>(
    strategy?.year || new Date().getFullYear(),
  );
  const [loading, setLoading] = useState(false);

  // Estados para accordion
  const [expandedSections, setExpandedSections] = useState({
    titulo: true,
    roteiro: false,
    comoFazer: false,
    hashtags: false,
    horario: false,
  });

  const supabase = createClient();

  useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  // Carregar estratégia do mês selecionado
  useEffect(() => {
    const loadMonthStrategy = async () => {
      setLoading(true);
      try {
        const { data: strategies } = await supabase
          .from("strategies")
          .select(
            `
            *,
            strategy_days (
              id,
              day_number,
              posts,
              created_at
            )
          `,
          )
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .order("created_at", { ascending: false })
          .limit(1);

        if (strategies && strategies.length > 0) {
          setLocalStrategy(strategies[0] as Strategy);
        } else {
          setLocalStrategy(null);
        }
      } catch (error) {
        console.error("Erro ao carregar estratégia:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMonthStrategy();
  }, [currentMonth, currentYear, supabase]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleToggleComplete = async (post: Post, dayId: string) => {
    const postId = post.id || `${post.time}-${post.content_type}`;
    setUpdatingPost(postId);

    try {
      const newCompletedState = !post.completed;
      console.log(
        `🔄 [CALENDÁRIO] Marcando post ${postId} como ${newCompletedState ? "concluído" : "pendente"}`,
      );

      if (newCompletedState) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8B5CF6", "#10B981", "#FBBF24"],
        });
      }

      // Buscar o dia atual do banco
      const { data: currentDay, error: fetchError } = await supabase
        .from("strategy_days")
        .select("posts")
        .eq("id", dayId)
        .single();

      if (fetchError) {
        console.error("❌ Erro ao buscar dia:", fetchError);
        throw fetchError;
      }

      // Criar cópia dos posts e atualizar o específico
      const updatedPosts = JSON.parse(JSON.stringify(currentDay.posts || []));

      // Encontrar o índice do post pelo ID ou por time+content_type
      const postIndex = updatedPosts.findIndex((p: any) => {
        const pId = p.id || `${p.time}-${p.content_type}`;
        return pId === postId;
      });

      if (postIndex !== -1) {
        updatedPosts[postIndex].completed = newCompletedState;
      }

      // Atualizar no banco
      const { error, data } = await supabase
        .from("strategy_days")
        .update({ posts: updatedPosts })
        .eq("id", dayId)
        .select();

      if (error) {
        console.error("❌ Erro do Supabase:", error);
        throw error;
      }

      console.log("✅ Resposta do Supabase:", data);

      // Atualizar estado local - FORÇAR RECARGA COMPLETA
      setTimeout(async () => {
        // Recarregar toda a estratégia para garantir consistência
        const { data: refreshedStrategy } = await supabase
          .from("strategies")
          .select(
            `
            *,
            strategy_days (
              id,
              day_number,
              posts,
              created_at
            )
          `,
          )
          .eq("id", localStrategy?.id)
          .single();

        if (refreshedStrategy) {
          setLocalStrategy(refreshedStrategy as Strategy);
        }

        setSelectedPost(null);
        setSelectedDay(null);
        setUpdatingPost(null);
      }, 300);
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      setUpdatingPost(null);
    }
  };

  const handleSearchProduct = (query: string) => {
    const searchQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localStrategy) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-3"
      >
        <Card className="w-full max-w-2xl border-2 border-primary/20 bg-card rounded-2xl">
          <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
            <motion.div
              className="flex size-24 items-center justify-center rounded-full bg-primary/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <CalendarDays className="size-12 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-primary">
                Nenhuma estratégia para {currentMonth}/{currentYear}
              </h2>
              <p className="text-lg text-muted-foreground">
                Volte para o dashboard e gere uma nova estratégia 🗓️
              </p>
            </div>

            <Button
              asChild
              className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6 py-5"
            >
              <Link href="/dashboard">
                <Sparkles className="size-5" />
                Gerar estratégia
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const strategyDays = localStrategy?.strategy_days || [];
  const sortedDays = [...strategyDays].sort(
    (a, b) => a.day_number - b.day_number,
  );

  // Calcular progresso
  let totalPosts = 0;
  let completedPosts = 0;

  sortedDays.forEach((day) => {
    if (day.posts && Array.isArray(day.posts)) {
      totalPosts += day.posts.length;
      completedPosts += day.posts.filter((p) => p.completed).length;
    }
  });

  const completionPercentage =
    totalPosts > 0 ? (completedPosts / totalPosts) * 100 : 0;
  const streak = calculateStreak(sortedDays);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const dayMap = new Map<number, StrategyDay>();
  sortedDays.forEach((d) => dayMap.set(d.day_number, d));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 pb-12"
    >
      {/* Header com navegação e streak */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="border-primary/20 rounded-full"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold px-4">
            <CalendarDays className="size-6 md:size-8 text-primary" />
            <span className="text-primary">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
          </h1>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="border-primary/20 rounded-full"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Streak e Progresso em linha */}
        <div className="flex items-center gap-3">
          {/* Streak com foguete */}
          <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-full px-4 py-2">
            <Rocket className={cn("size-5", getRocketColor(streak))} />
            <span className="font-bold text-sm text-yellow-500">{streak}</span>
            <span className="text-xs text-muted-foreground">dias</span>
          </div>

          {/* Progresso */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-xl">
            <CardContent className="py-2 px-4 flex items-center gap-3">
              <Award className="size-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Progresso</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">
                    {completedPosts}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {totalPosts}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Barra de progresso */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border border-primary/10 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                Progresso do mês
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {["Reels", "Carrossel", "Stories", "Post Estático", "Live"].map(
          (type) => {
            const Icon = contentTypeIcons[type] || FileText;
            return (
              <Badge
                key={type}
                variant="outline"
                className="flex items-center gap-1 text-xs border-primary/20 rounded-full py-1 px-3"
              >
                <Icon className="size-3 text-primary" />
                {type}
              </Badge>
            );
          },
        )}
      </motion.div>

      {/* Calendário Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-primary/20 bg-card rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Dias vazios do início do mês */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-lg bg-transparent"
                />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dayData = dayMap.get(dayNum);
                const hasPosts = dayData?.posts && dayData.posts.length > 0;

                if (!hasPosts) {
                  return (
                    <div
                      key={dayNum}
                      className="aspect-square rounded-lg bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200/20 flex items-center justify-center"
                    >
                      <span className="text-xs text-muted-foreground/30">
                        {dayNum}
                      </span>
                    </div>
                  );
                }

                const completedCount = dayData.posts.filter(
                  (p) => p.completed,
                ).length;
                const totalCount = dayData.posts.length;
                const isComplete = completedCount === totalCount;
                const isPartial =
                  completedCount > 0 && completedCount < totalCount;

                return (
                  <motion.button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayData)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all relative",
                      isComplete && "border-green-500 bg-green-500/20",
                      isPartial && "border-primary bg-primary/20",
                      !isComplete &&
                        !isPartial &&
                        "border-primary/50 bg-primary/10 hover:border-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isComplete && "text-green-600",
                        isPartial && "text-primary",
                      )}
                    >
                      {dayNum}
                    </span>

                    <div className="flex gap-0.5 mt-1">
                      {dayData.posts.slice(0, 3).map((post, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            post.completed ? "bg-green-500" : "bg-primary",
                          )}
                        />
                      ))}
                      {dayData.posts.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">
                          +{dayData.posts.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal do Dia */}
      <AnimatePresence>
        {selectedDay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
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
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border-2 border-primary/20 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  Dia {selectedDay.day_number}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDay(null)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {selectedDay.posts.map((post, index) => {
                  const Icon = getContentIcon(post.content_type);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        post.completed
                          ? "border-green-500 bg-green-500/10"
                          : "border-primary/30 bg-primary/5 hover:border-primary hover:shadow-lg",
                      )}
                      onClick={() => {
                        setSelectedPost(post);
                        // Reset accordion quando abrir novo post
                        setExpandedSections({
                          titulo: true,
                          roteiro: false,
                          comoFazer: false,
                          hashtags: false,
                          horario: false,
                        });
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            post.completed
                              ? "bg-green-500/20"
                              : "bg-primary/20",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5",
                              post.completed
                                ? "text-green-600"
                                : "text-primary",
                            )}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-lg">
                              {post.time}
                            </span>
                            <Badge
                              className={cn(
                                "border rounded-full px-3",
                                getContentColor(post.content_type),
                              )}
                            >
                              {post.content_type}
                            </Badge>
                            {post.completed && (
                              <Badge className="bg-green-500 rounded-full px-3">
                                ✅ Concluído
                              </Badge>
                            )}
                          </div>

                          <p className="text-lg font-medium mb-1">
                            {post.topic}
                          </p>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.script.substring(0, 100)}...
                          </p>
                        </div>

                        <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal do Post - COM ACCORDION */}
      <AnimatePresence>
        {selectedPost && selectedDay && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl border-2 border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-primary">
                      {selectedPost.time}
                    </h3>
                    <Badge
                      className={cn(
                        "border rounded-full px-4 py-1",
                        getContentColor(selectedPost.content_type),
                      )}
                    >
                      {selectedPost.content_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dia {selectedDay.day_number} • {selectedDay.day_number} de{" "}
                    {monthNames[currentMonth - 1]}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Título do Conteúdo - Accordion */}
                <div className="border border-primary/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("titulo")}
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      Título do Conteúdo
                    </span>
                    {expandedSections.titulo ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.titulo && (
                    <div className="p-4 bg-card border-t border-primary/10">
                      <p className="text-base font-medium text-white">
                        {selectedPost.topic}
                      </p>
                    </div>
                  )}
                </div>

                {/* Roteiro Detalhado - Accordion */}
                <div className="border border-primary/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("roteiro")}
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      Roteiro Detalhado
                    </span>
                    {expandedSections.roteiro ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.roteiro && (
                    <div className="p-4 bg-card border-t border-primary/10">
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                        {selectedPost.script}
                      </p>
                    </div>
                  )}
                </div>

                {/* Como fazer este conteúdo - Accordion */}
                <div className="border border-primary/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("comoFazer")}
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Video className="size-4 text-primary" />
                      Como fazer este conteúdo
                    </span>
                    {expandedSections.comoFazer ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.comoFazer && (
                    <div className="p-4 bg-card border-t border-primary/10">
                      <p className="text-sm text-white">
                        Para criar este{" "}
                        {selectedPost.content_type.toLowerCase()}, siga estas
                        etapas:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-white">
                        <li>
                          Prepare o cenário e iluminação adequados para destacar
                          o produto
                        </li>
                        <li>
                          Use um roteiro claro e objetivo, como descrito acima
                        </li>
                        <li>
                          Grave em plano aberto e close para mostrar detalhes
                        </li>
                        <li>
                          Edite com cortes dinâmicos e música de fundo adequada
                        </li>
                        <li>Adicione legendas para facilitar o entendimento</li>
                        <li>
                          Inclua uma chamada para ação no final (link na bio,
                          direct, etc.)
                        </li>
                      </ul>
                      <p className="text-sm text-white mt-2">
                        {selectedPost.content_type === "Reels" &&
                          "Use transições rápidas, músicas em alta e mantenha entre 15-30 segundos."}
                        {selectedPost.content_type === "Stories" &&
                          "Use enquetes, caixinhas de perguntas e links para aumentar o engajamento."}
                        {selectedPost.content_type === "Carrossel" &&
                          "Use 5-10 imagens de alta qualidade com texto curto e objetivo."}
                        {selectedPost.content_type === "Post Estático" &&
                          "Use imagem de alta resolução com texto sobreposto legível."}
                        {selectedPost.content_type === "Live" &&
                          "Avise com antecedência, interaja com comentários e tenha um roteiro de pautas."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hashtags - Accordion */}
                <div className="border border-primary/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("hashtags")}
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Hash className="size-4 text-primary" />
                      Hashtags
                    </span>
                    {expandedSections.hashtags ? (
                      <ChevronUp className="size-4 text-primary" />
                    ) : (
                      <ChevronDown className="size-4 text-primary" />
                    )}
                  </button>
                  {expandedSections.hashtags && (
                    <div className="p-4 bg-card border-t border-primary/10">
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.hashtags.split(/\s+/).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-sm bg-primary/10 text-white hover:bg-primary/20 cursor-pointer rounded-full px-3 py-1"
                            onClick={() =>
                              window.open(
                                `https://www.instagram.com/explore/tags/${tag.replace("#", "")}`,
                                "_blank",
                              )
                            }
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dica de Horário - SEM ACCORDION, SEMPRE VISÍVEL */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="size-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                      Melhor horário para publicar
                    </span>
                  </div>
                  <p className="text-sm text-white">
                    {selectedPost.content_type === "Reels" &&
                      "Publique entre 18h e 22h, quando as pessoas estão relaxando em casa após o trabalho. Este horário tem maior retenção para vídeos curtos."}
                    {selectedPost.content_type === "Stories" &&
                      "Os melhores horários são 12h-14h (horário de almoço) ou 19h-21h (pós trabalho), quando as pessoas verificam Stories com mais frequência."}
                    {selectedPost.content_type === "Carrossel" &&
                      "Recomendamos publicar às 10h ou 15h, horários de pico para conteúdos educativos e de leitura mais longa."}
                    {selectedPost.content_type === "Post Estático" &&
                      "Os horários ideais são 9h-11h (início da manhã) ou 20h-22h (noite), quando o feed tem maior engajamento."}
                    {selectedPost.content_type === "Live" &&
                      "O melhor horário é às 20h, quando a maioria das pessoas está em casa e disponível para assistir conteúdos ao vivo."}
                  </p>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() =>
                      handleToggleComplete(selectedPost, selectedDay.id)
                    }
                    disabled={
                      updatingPost ===
                      (selectedPost.id ||
                        `${selectedPost.time}-${selectedPost.content_type}`)
                    }
                    variant={selectedPost.completed ? "outline" : "default"}
                    className={cn(
                      "flex-1 gap-2 rounded-xl py-6",
                      selectedPost.completed
                        ? "border-green-500/30 hover:bg-green-500/10 text-white"
                        : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white",
                    )}
                  >
                    {updatingPost ===
                    (selectedPost.id ||
                      `${selectedPost.time}-${selectedPost.content_type}`) ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : selectedPost.completed ? (
                      <>
                        <X className="size-4" />
                        Desmarcar
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleSearchProduct(
                        `${selectedPost.content_type} ${selectedPost.topic} exemplos`,
                      )
                    }
                    className="gap-2 rounded-xl px-6 border-primary/30 hover:bg-primary/10 text-white"
                  >
                    <ExternalLink className="size-4" />
                    Ver Exemplos
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
