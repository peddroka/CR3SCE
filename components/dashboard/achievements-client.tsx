"use client";

import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  business: any;
  strategies: any[];
  totalCompleted: number;
  totalPosts: number;
  monthsActive: number;
}

export function AchievementsClient({
  business,
  strategies,
  totalCompleted,
  totalPosts,
  monthsActive,
}: Props) {
  const progress = totalPosts > 0 ? Math.round((totalCompleted / totalPosts) * 100) : 0;

  const achievements = [
    {
      id: "first_post",
      icon: "🎯",
      title: "Primeiro Post",
      description: "Marcou seu primeiro conteúdo como concluído",
      unlocked: totalCompleted >= 1,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/30",
    },
    {
      id: "ten_posts",
      icon: "🔥",
      title: "Em Chamas",
      description: "10 posts concluídos",
      unlocked: totalCompleted >= 10,
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/30",
    },
    {
      id: "fifty_posts",
      icon: "⚡",
      title: "Máquina de Conteúdo",
      description: "50 posts concluídos",
      unlocked: totalCompleted >= 50,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/30",
    },
    {
      id: "hundred_posts",
      icon: "💎",
      title: "Lenda do Conteúdo",
      description: "100 posts concluídos",
      unlocked: totalCompleted >= 100,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/30",
    },
    {
      id: "first_month",
      icon: "📅",
      title: "Primeiro Mês",
      description: "Completou seu primeiro mês de estratégia",
      unlocked: monthsActive >= 1,
      color: "text-[#C8F135]",
      bg: "bg-[#C8F135]/10 border-[#C8F135]/30",
    },
    {
      id: "three_months",
      icon: "🏆",
      title: "Consistência",
      description: "3 meses consecutivos com estratégia",
      unlocked: monthsActive >= 3,
      color: "text-[#C8F135]",
      bg: "bg-[#C8F135]/10 border-[#C8F135]/30",
    },
    {
      id: "half_month",
      icon: "🌟",
      title: "Meio Caminho",
      description: "50% de um mês concluído",
      unlocked: progress >= 50,
      color: "text-pink-400",
      bg: "bg-pink-400/10 border-pink-400/30",
    },
    {
      id: "full_month",
      icon: "👑",
      title: "Mês Perfeito",
      description: "100% de um mês concluído",
      unlocked: progress >= 100,
      color: "text-yellow-300",
      bg: "bg-yellow-300/10 border-yellow-300/30",
    },
  ];

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <Trophy className="size-7 text-[#C8F135]" />
          Conquistas
        </h1>
        <p className="mt-1 text-sm text-[#888]">
          Veja o que você já conquistou na sua jornada de conteúdo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: CheckCircle2, label: "Posts concluídos", value: totalCompleted, color: "text-[#C8F135]" },
          { icon: Calendar, label: "Meses ativos", value: monthsActive, color: "text-blue-400" },
          { icon: TrendingUp, label: "Taxa de conclusão", value: `${progress}%`, color: "text-purple-400" },
          {
            icon: Award,
            label: "Conquistas",
            value: `${unlockedCount}/${achievements.length}`,
            color: "text-yellow-400",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-xl border border-border bg-card">
              <CardContent className="p-5">
                <stat.icon className={`mb-3 size-5 ${stat.color}`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-[#888]">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#C8F135]/20 bg-card">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            <div className="w-1 shrink-0 bg-[#C8F135]" />
            <div className="flex flex-1 items-start gap-4 p-5">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#C8F135]/10">
                <Zap className="size-5 text-[#C8F135]" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#C8F135]">
                  Seu Progresso
                </p>
                <p className="text-sm leading-relaxed text-[#c0c0c0]">
                  {totalCompleted === 0
                    ? `Olá, ${business?.responsible_name?.split(" ")[0] ?? ""}! Você acabou de começar sua jornada no CR3SCE. Seu primeiro post marcado como concluído vai desbloquear sua primeira conquista. Vamos lá!`
                    : totalCompleted < 10
                      ? `Ótimo começo, ${business?.responsible_name?.split(" ")[0] ?? ""}! Você já concluiu ${totalCompleted} post${totalCompleted > 1 ? "s" : ""} para ${business?.business_name ?? "seu negócio"}. Continue assim — consistência é o segredo do crescimento.`
                      : totalCompleted < 50
                        ? `Você está pegando o ritmo! ${totalCompleted} posts concluídos para ${business?.business_name ?? "seu negócio"} em ${monthsActive} ${monthsActive === 1 ? "mês" : "meses"} de estratégia. Sua presença digital está se fortalecendo.`
                        : `Impressionante! ${totalCompleted} posts concluídos ao longo de ${monthsActive} ${monthsActive === 1 ? "mês" : "meses"}. ${business?.business_name ?? "Seu negócio"} está construindo uma presença digital sólida e consistente. Continue nesse ritmo!`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
          Todas as Conquistas ({unlockedCount}/{achievements.length} desbloqueadas)
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "rounded-xl border transition-all",
                  achievement.unlocked
                    ? achievement.bg
                    : "border-border bg-white/5 opacity-50 grayscale",
                )}
              >
                <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                  <span className="text-4xl">{achievement.icon}</span>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        achievement.unlocked ? achievement.color : "text-[#555]",
                      )}
                    >
                      {achievement.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#666]">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white">
                      ✓ Desbloqueado
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[#555]">
                      Bloqueado
                    </span>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {strategies.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
            Histórico de Estratégias
          </h2>
          <div className="flex flex-col gap-2">
            {strategies.map((strategy, index) => {
              const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

              return (
                <div
                  key={strategy.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Star className="size-4 text-[#C8F135]" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {monthNames[(strategy.month ?? 1) - 1]} {strategy.year}
                      </p>
                      <p className="text-xs text-[#555]">Estratégia gerada</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#C8F135]/10 px-3 py-1 text-[11px] font-medium text-[#C8F135]">
                    #{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
