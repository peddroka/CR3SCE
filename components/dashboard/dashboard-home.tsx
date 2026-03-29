"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Flame from "lucide-react/dist/esm/icons/flame";
import Globe from "lucide-react/dist/esm/icons/globe";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Store from "lucide-react/dist/esm/icons/store";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Users from "lucide-react/dist/esm/icons/users";
import { Card, CardContent } from "@/components/ui/card";
import { MissionsModal } from "@/components/dashboard/missions-modal";
import { InstagramModal } from "@/components/dashboard/instagram-modal";
import { InlineChat } from "@/components/dashboard/inline-chat";
import { cn } from "@/lib/utils";

interface StrategyDay {
  id: string;
  day_number: number;
  completed?: boolean;
  posts?: { completed?: boolean }[];
}

interface Strategy {
  id: string;
  month: number;
  year: number;
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
}

interface DashboardHomeProps {
  profile: { full_name: string | null } | null;
  business: Business | null;
  latestStrategy: Strategy | null;
  userId: string;
}

interface StatCard {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: number | string;
  label: string;
  sub: string;
  badge?: string | null;
  onClick?: () => void;
}

function calculateStreak(days: StrategyDay[]) {
  const today = new Date().getDate();
  let streak = 0;

  for (let i = today; i >= 1; i--) {
    const day = days.find((item) => item.day_number === i);
    if (!day) continue;
    const done =
      day.posts?.some((post) => post.completed) || day.completed || false;
    if (!done) break;
    streak++;
  }

  return streak;
}

export function DashboardHome({
  profile,
  business,
  latestStrategy,
  userId,
}: DashboardHomeProps) {
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);

  const firstName =
    business?.responsible_name?.split(" ")[0] ||
    profile?.full_name?.split(" ")[0] ||
    "Usuario";
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
    if (day.posts?.length) {
      totalPosts += day.posts.length;
      completedPosts += day.posts.filter((post) => post.completed).length;
    } else if (day.completed !== undefined) {
      totalPosts += 1;
      if (day.completed) completedPosts += 1;
    }
  });

  const progress =
    totalPosts > 0 ? Math.round((completedPosts / totalPosts) * 100) : 0;
  const streak = calculateStreak(strategyDays);

  const stats: StatCard[] = [
    {
      icon: CheckCircle2,
      value: completedPosts,
      label: "Posts feitos",
      sub: `de ${totalPosts} no mes`,
    },
    {
      icon: Flame,
      value: streak,
      label: "Dias seguidos",
      sub: streak >= 2 ? "Continue assim!" : "Comece hoje!",
      badge: streak >= 2 ? "streak" : null,
    },
    {
      icon: TrendingUp,
      value: `${progress}%`,
      label: "Progresso",
      sub: progress >= 50 ? "Mais da metade!" : "Vamos la!",
    },
  ];

  const getMainGoalLabel = (goal: string) =>
    (
      {
        visualizacao: "Aumentar visualizacao",
        identidade: "Construir identidade",
        engajamento: "Aumentar engajamento",
        seguidores: "Ganhar seguidores",
        vendas: "Aumentar vendas",
        autoridade: "Construir autoridade",
        leads: "Gerar leads",
      }[goal] || goal
    );
  const getPlatformsLabel = (platforms: string) =>
    (
      {
        instagram: "Instagram",
        todas: "Todas as redes",
      }[platforms] || platforms
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-12"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ola, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao seu painel de marketing inteligente.
          </p>
        </div>
        <div
          id="streak-indicator"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2"
        >
          <Rocket className="size-5 text-lime" />
          <span className="text-sm font-bold text-white">{streak}</span>
          <span className="text-xs text-[#888888]">dias</span>
        </div>
      </motion.div>

      {business && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden rounded-xl border border-border bg-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-start gap-4 md:flex-row">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-white/5">
                  <Store className="size-8 text-lime" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {business.business_name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {business.niche} •{" "}
                        {business.growth_speed === "rapido" &&
                          "Explosivo (stories, feed, reels e viral no fim de semana)"}
                        {business.growth_speed === "moderado" &&
                          "Moderado (stories diarios, feed diario e reels semanais)"}
                        {business.growth_speed === "leve" &&
                          "Leve (2-3x por semana)"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-border bg-white/5 p-2">
                        <Target className="size-4 text-lime" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Objetivo</p>
                        <p className="text-sm font-medium text-white">
                          {getMainGoalLabel(business.main_goal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-border bg-white/5 p-2">
                        <Globe className="size-4 text-lime" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Plataformas
                        </p>
                        <p className="text-sm font-medium text-white">
                          {getPlatformsLabel(business.platforms)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-border bg-white/5 p-2">
                        <Users className="size-4 text-lime" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Público</p>
                        <p className="line-clamp-1 text-sm font-medium text-white">
                          {business.target_audience.split(" ").slice(0, 4).join(" ")}
                          ...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-border bg-white/5 p-2">
                        <Instagram className="size-4 text-lime" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Instagram
                        </p>
                        {business.instagram_handle ? (
                          <a
                            href={`https://instagram.com/${business.instagram_handle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#C8F135] hover:underline"
                          >
                            @{business.instagram_handle.replace("@", "")}
                          </a>
                        ) : (
                          <button
                            onClick={() => setShowInstagramModal(true)}
                            className="text-sm font-medium text-yellow-500 hover:underline"
                          >
                            Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "rounded-xl border border-border bg-card transition-colors",
                stat.onClick && "cursor-pointer hover:border-[#C8F135]/30",
              )}
              onClick={stat.onClick}
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <stat.icon className="size-5 text-lime" />
                  {index === 1 && stat.badge && (
                    <span className="rounded-full border border-[#C8F135]/20 bg-[#C8F135]/10 px-2 py-0.5 text-[10px] font-medium text-[#C8F135]">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-2xl font-bold leading-none text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-[#c0c0c0]">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#666666]">
                    {stat.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {latestStrategy && isCurrentMonthStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <Card className="overflow-hidden rounded-xl border border-border bg-card">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                <div className="w-1 shrink-0 bg-[#C8F135]" />
                <div className="flex flex-1 items-start gap-4 p-5">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Sparkles className="size-4 text-lime" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-lime">
                      Dica do dia
                    </p>
                    <p className="text-sm leading-relaxed text-[#c0c0c0]">
                      {progress < 30
                        ? "Poste nos primeiros 3 dias da semana para ativar o algoritmo. Consistencia no inicio da semana gera mais alcance."
                        : progress < 60
                          ? "Voce esta indo bem! Interaja com os comentarios dos seus posts nas primeiras horas apos publicar. Isso ajuda o alcance."
                          : progress < 90
                            ? "Reta final do mes! Reels costumam entregar mais alcance que posts estaticos. Priorize video nesta fase."
                            : "Mes quase completo! Compartilhe um resultado real que voce teve neste mes nos Stories. Prova social converte muito."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="flex flex-col items-center gap-3 py-2"
      >
        <div className="flex items-center gap-2 rounded-full border border-[#C8F135]/30 bg-[#C8F135]/8 px-5 py-2.5">
          <Sparkles className="size-4 text-[#C8F135]" />
          <span className="text-sm font-medium text-[#c0c0c0]">
            Sua IA Pessoal — tire dúvidas, peça ideias, converse
          </span>
        </div>

        <motion.svg
          width="48"
          height="64"
          viewBox="0 0 48 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <motion.line
            x1="24"
            y1="4"
            x2="24"
            y2="46"
            stroke="#C8F135"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.line
            x1="24"
            y1="58"
            x2="10"
            y2="42"
            stroke="#C8F135"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
          <motion.line
            x1="24"
            y1="58"
            x2="38"
            y2="42"
            stroke="#C8F135"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
          <circle cx="24" cy="58" r="4" fill="#C8F135" opacity="0.3" />
        </motion.svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <InlineChat
          businessName={business?.business_name}
          niche={business?.niche}
          mainGoal={business?.main_goal}
          platforms={business?.platforms}
          userId={userId}
        />
      </motion.div>

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
    </motion.div>
  );
}
