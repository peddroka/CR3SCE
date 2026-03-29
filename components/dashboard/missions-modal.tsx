"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rocket, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: any;
  completedPosts: number;
  totalPosts: number;
  streak: number;
  progress: number;
}

export function MissionsModal({
  open,
  onOpenChange,
  business,
  completedPosts,
  streak,
}: MissionsModalProps) {
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
      };
    }

    if (business?.growth_speed === "moderado") {
      return {
        title: "⚡ Consistência",
        description: "Complete 15 posts no mês",
        target: 15,
        emoji: "⚡",
      };
    }

    return {
      title: "🌱 Crescimento Leve",
      description: "Complete 8 posts no mês",
      target: 8,
      emoji: "🌱",
    };
  };

  const mainMission = getMainMission();
  const mainProgress = Math.min(
    (completedPosts / mainMission.target) * 100,
    100,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        <DialogHeader className="p-4 pb-2 sm:p-6">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Target className="size-5 text-primary sm:size-6" />
            Missões
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Acompanhe seu progresso e sequência de postagens
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)] px-4 pb-6 sm:px-6">
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-xl border border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0 rounded-xl bg-primary/20 p-3 sm:p-4">
                    <span className="text-2xl sm:text-4xl">
                      {mainMission.emoji}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-base font-semibold sm:text-xl">
                      {mainMission.title}
                    </h3>
                    <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
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
                      <Badge className="mt-3 rounded-full border-green-500/30 bg-green-500/20 px-3 py-1 text-xs text-green-500 sm:px-4">
                        🏆 Missão Principal Concluída!
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-xl p-3",
                      streak === 0 ? "bg-gray-500/10" : "bg-primary/10",
                    )}
                  >
                    <Rocket
                      className={cn(
                        "size-5 sm:size-6",
                        streak >= 1 ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold sm:text-base">
                      Sequência Atual
                    </h3>
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                      {streak === 0
                        ? "Comece hoje!"
                        : `${streak} ${streak === 1 ? "dia" : "dias"} seguidos!`}
                    </p>
                  </div>
                  <Badge className="rounded-full px-3 py-1 text-sm sm:px-4 sm:text-base">
                    🚀 {streak}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold sm:text-base">
                  Próximos Marcos
                </h3>
                <div className="space-y-3">
                  {[1, 2, 4, 8, 16, 32, 64].map((target) => {
                    const isUnlocked = streak >= target;
                    const colors: Record<number, string> = {
                      1: "bg-gray-500",
                      2: "bg-orange-500",
                      4: "bg-yellow-500",
                      8: "bg-green-500",
                      16: "bg-blue-500",
                      32: "bg-purple-500",
                      64: "bg-pink-600",
                    };

                    return (
                      <div key={target} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            isUnlocked ? colors[target] : "bg-gray-700",
                          )}
                        />
                        <span className="flex-1 text-xs sm:text-sm">
                          {target} {target === 1 ? "dia" : "dias"} de sequência
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isUnlocked ? "text-[#C8F135]" : "text-[#555]",
                          )}
                        >
                          {isUnlocked ? "✓" : `${streak}/${target}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
