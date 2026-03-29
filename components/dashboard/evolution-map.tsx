"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LevelOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  price?: string;
}

interface Level {
  id: string;
  level_number: number;
  title: string;
  description: string;
  missions?: any[];
  reward?: string;
  required_investment?: number;
  options?: LevelOption[];
}

export function EvolutionMap({
  levels,
  investment,
  completedChoices,
  onCompleteLevel,
}: {
  levels: Level[];
  investment: number;
  completedChoices: Record<string, string>;
  onCompleteLevel: (levelId: string, chosenOptionId: string) => void;
}) {
  void investment;

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const isLevelUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevLevel = levels[index - 1];
    return !!completedChoices[prevLevel?.id];
  };

  const isLevelCompleted = (level: Level): boolean => {
    return !!completedChoices[level.id];
  };

  const getChosenOption = (level: Level): LevelOption | null => {
    const chosenId = completedChoices[level.id];
    if (!chosenId) return null;
    const options = level.options || [];
    return options.find((option) => option.id === chosenId) || null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {levels.map((level, index) => {
          const unlocked = isLevelUnlocked(index);
          const completed = isLevelCompleted(level);
          const chosenOption = getChosenOption(level);
          const isCurrent = unlocked && !completed;

          return (
            <motion.div
              key={`level-${level.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                disabled={!unlocked}
                onClick={() => unlocked && setSelectedLevel(level)}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-all",
                  completed && "border-[#C8F135]/50 bg-[#C8F135]/5",
                  isCurrent && "animate-pulse border-[#C8F135] bg-[#C8F135]/10",
                  !unlocked &&
                    "cursor-not-allowed border-border/30 bg-white/5 opacity-40",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold",
                      completed && "border-[#C8F135] bg-[#C8F135] text-[#111]",
                      isCurrent &&
                        "border-[#C8F135] bg-[#C8F135]/20 text-[#C8F135]",
                      !unlocked && "border-border bg-white/5 text-[#555]",
                    )}
                  >
                    {completed ? "✓" : !unlocked ? <Lock className="size-5" /> : level.level_number}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          completed
                            ? "text-[#C8F135]"
                            : isCurrent
                              ? "text-white"
                              : "text-[#555]",
                        )}
                      >
                        {unlocked
                          ? level.title
                          : `Nivel ${level.level_number} - Bloqueado`}
                      </p>
                      {isCurrent && (
                        <span className="rounded-full bg-[#C8F135] px-2 py-0.5 text-[10px] font-bold text-[#111]">
                          ATUAL
                        </span>
                      )}
                    </div>
                    {completed && chosenOption ? (
                      <p className="mt-0.5 text-xs text-[#888]">
                        ✓ Escolheu: {chosenOption.icon} {chosenOption.title}
                      </p>
                    ) : unlocked ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#888]">
                        {level.description}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-[#555]">
                        Complete o nivel anterior para desbloquear
                      </p>
                    )}
                  </div>

                  {unlocked && !completed && (
                    <ChevronRight className="size-5 shrink-0 text-[#C8F135]" />
                  )}
                </div>

                {index < levels.length - 1 && (
                  <div
                    className={cn(
                      "ml-6 mt-3 h-4 w-0.5",
                      completed ? "bg-[#C8F135]/40" : "bg-border/30",
                    )}
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedLevel && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            onClick={() => {
              setSelectedLevel(null);
              setSelectedOption(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10">
                  <span className="text-2xl font-bold text-[#C8F135]">
                    {selectedLevel.level_number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedLevel.title}
                </h3>
                <p className="mt-1 text-sm text-[#888]">
                  {selectedLevel.description}
                </p>
                {selectedLevel.reward && (
                  <p className="mt-2 text-xs text-[#C8F135]">
                    Recompensa: {selectedLevel.reward}
                  </p>
                )}
              </div>

              {!isLevelCompleted(selectedLevel) ? (
                <>
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-[#555]">
                    Escolha uma opcao para concluir este nivel:
                  </p>

                  {(!selectedLevel.options || selectedLevel.options.length === 0) && (
                    <p className="py-4 text-center text-sm text-[#888]">
                      Opcoes nao disponiveis. Tente gerar a jornada novamente.
                    </p>
                  )}

                  {!!selectedLevel.options?.length && (
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      {(selectedLevel.options || []).map((option, optIdx) => (
                        <button
                          key={`option-${option.id}-${optIdx}`}
                          onClick={() =>
                            setSelectedOption(
                              selectedOption === option.id ? null : option.id,
                            )
                          }
                          className={cn(
                            "rounded-xl border-2 p-4 text-left transition-all",
                            selectedOption === option.id
                              ? "border-[#C8F135] bg-[#C8F135]/10"
                              : "border-border bg-white/5 hover:border-[#C8F135]/40",
                          )}
                        >
                          <span className="mb-2 block text-2xl">
                            {option.icon}
                          </span>
                          <p className="text-xs font-bold leading-snug text-white">
                            {option.title}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#888]">
                            {option.description}
                          </p>
                          {option.price && (
                            <p className="mt-2 text-[10px] font-medium text-[#C8F135]">
                              {option.price}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    disabled={!selectedOption || !selectedLevel.options?.length}
                    onClick={() => {
                      if (selectedOption) {
                        onCompleteLevel(selectedLevel.id, selectedOption);
                        setSelectedLevel(null);
                        setSelectedOption(null);
                      }
                    }}
                    className="w-full bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020] disabled:opacity-50"
                  >
                    {selectedOption ? "Confirmar escolha" : "Selecione uma opcao"}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#C8F135]/10 p-3 text-[#C8F135]">
                    <CheckCircle2 className="size-5" />
                    <span className="text-sm font-medium">Nivel concluido!</span>
                  </div>
                  {getChosenOption(selectedLevel) && (
                    <p className="text-sm text-[#888]">
                      Voce escolheu: {getChosenOption(selectedLevel)?.icon}{" "}
                      {getChosenOption(selectedLevel)?.title}
                    </p>
                  )}
                  <Button
                    className="mt-4 w-full bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
                    onClick={() => setSelectedLevel(null)}
                  >
                    Fechar
                  </Button>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedLevel(null);
                  setSelectedOption(null);
                }}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[#555] hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
