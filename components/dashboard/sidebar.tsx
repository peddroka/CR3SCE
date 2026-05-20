"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Zap,
  Trophy,
  Star,
  Clapperboard,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { resetSupabaseBrowserSession } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ONBOARDING_DRAFT_PREFIX = "cr3sce_onboarding_draft";

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Inicio",
      icon: LayoutDashboard,
      id: "nav-inicio",
    },
    {
      href: "/dashboard/calendar",
      label: "Calendario",
      icon: CalendarDays,
      id: "nav-calendario",
    },
    {
      href: "/dashboard/evolution",
      label: "Jornada",
      icon: TrendingUp,
      id: "nav-evolucao",
    },
    {
      href: "/dashboard/trends",
      label: "Modo Tendencia",
      icon: Zap,
      id: "nav-tendencia",
    },
    {
      href: "/dashboard/achievements",
      label: "Conquistas",
      icon: Trophy,
      id: "nav-conquistas",
    },
    {
      href: "/dashboard/score",
      label: "Score do Perfil",
      icon: Star,
      id: "nav-score",
    },
    {
      href: "/dashboard/video-editor",
      label: "Editar Vídeo",
      icon: Clapperboard,
      id: "nav-editar-video",
      badge: "BETA",
    },
    {
      href: "/dashboard/criar-post",
      label: "Criar Post",
      icon: Wand2,
      id: "nav-criar-post",
    },
    {
      href: "/dashboard/settings",
      label: "Configuracoes",
      icon: Settings,
      id: "nav-configuracoes",
    },
    {
      href: "/dashboard/privacidade",
      label: "Privacidade",
      icon: ShieldCheck,
      id: "nav-privacidade",
    },
  ];

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      try {
        for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
          const key = window.localStorage.key(index);
          if (key?.startsWith(ONBOARDING_DRAFT_PREFIX)) {
            window.localStorage.removeItem(key);
          }
        }
      } catch {}
    }

    // Audit log antes de invalidar a sessao
    try {
      await fetch("/api/lgpd/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth.logout" }),
      });
    } catch {}

    await resetSupabaseBrowserSession();
    router.push("/");
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-background px-5 py-4 md:hidden">
        <Link href="/dashboard">
          <Logo size="md" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#c0c0c0] hover:bg-white/5"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <Link
              href="/dashboard"
              className="mb-10 mt-12 flex items-center justify-center md:mt-0"
              onClick={() => setIsOpen(false)}
            >
              <Logo size="lg" />
            </Link>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={item.id}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-base font-medium transition-all duration-200",
                        isActive
                          ? "border-border bg-white/10 text-lime"
                          : "border-transparent text-[#c0c0c0] hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-5 shrink-0",
                          isActive ? "text-lime" : "text-[#888888]",
                        )}
                      />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-yellow-400">
                          {item.badge}
                        </span>
                      )}
                      {isActive && !item.badge && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-lime" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 border-t border-border px-4 py-4">
            <div className="mb-3 rounded-xl border border-border bg-white/5 px-4 py-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                Plano Ativo
              </p>
              <p className="text-xs font-medium text-[#c0c0c0]">CR3SCE Pro</p>
              <p className="mt-0.5 text-[11px] text-[#555]">R$79,90/mes</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-[#666] transition-all hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
