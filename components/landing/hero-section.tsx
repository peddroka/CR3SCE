"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-16 sm:pt-24 sm:pb-20">
      {/* Background com gradiente corrigido - ocupando 100% da largura */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-purple-600/20 blur-[80px] sm:h-[400px] sm:w-[400px]" />
        <div className="absolute top-1/3 left-1/3 h-[150px] w-[150px] rounded-full bg-blue-600/10 blur-[60px] sm:h-[300px] sm:w-[300px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 sm:px-4 sm:py-1.5"
          >
            <Sparkles className="size-3 sm:size-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Potencializado por Inteligência Artificial
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            Estratégias de marketing{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              inteligentes
            </span>{" "}
            para o seu negócio
          </motion.h1>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground px-4"
          >
            A Cresci.ai analisa seu negócio e gera estratégias de marketing
            personalizadas com um calendário de 30 dias de conteúdo. Tudo com
            inteligência artificial.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm sm:text-base"
              asChild
            >
              <Link href="/auth/sign-up">
                Começar Grátis
                <ArrowRight className="size-3 sm:size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base"
              asChild
            >
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Sem cartão de crédito. Cancele quando quiser.
          </motion.p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="relative mt-12 sm:mt-16 lg:mt-20 mx-auto max-w-5xl px-4"
        >
          <div className="relative rounded-xl border border-primary/20 bg-card/50 p-2 backdrop-blur-sm">
            <div className="rounded-lg border border-primary/10 bg-card p-4 sm:p-6">
              {/* Window Controls */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-destructive/60" />
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-chart-4/60" />
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-success/60" />
                <span className="ml-2 text-[10px] sm:text-xs text-muted-foreground">
                  Dashboard - Cresci.ai
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-lg border border-primary/10 bg-secondary/50 p-3 sm:p-4">
                  <div className="text-xs text-muted-foreground">
                    Engajamento
                  </div>
                  <div className="mt-1 text-xl sm:text-2xl font-bold text-success">
                    +47%
                  </div>
                </div>
                <div className="rounded-lg border border-primary/10 bg-secondary/50 p-3 sm:p-4">
                  <div className="text-xs text-muted-foreground">
                    Posts Agendados
                  </div>
                  <div className="mt-1 text-xl sm:text-2xl font-bold">24</div>
                </div>
                <div className="rounded-lg border border-primary/10 bg-secondary/50 p-3 sm:p-4">
                  <div className="text-xs text-muted-foreground">
                    Estratégia Ativa
                  </div>
                  <div className="mt-1 text-xl sm:text-2xl font-bold text-primary">
                    Mar 2026
                  </div>
                </div>
              </div>

              {/* Calendar Preview */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded text-[10px] sm:text-xs ${
                      i < 15
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
