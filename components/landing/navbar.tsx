"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/95 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-20 md:px-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Ir para o topo"
          className="shrink-0"
        >
          <span className="sm:hidden">
            <Logo size="md" />
          </span>
          <span className="hidden sm:inline-flex">
            <Logo size="lg" />
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-3.5 py-2.5 text-sm text-[#c0c0c0] transition-all hover:border-white/20 hover:bg-white/5 hover:text-white sm:px-4 sm:py-2"
          >
            Entrar
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg border border-white/10 bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#333333] sm:px-4 sm:py-2"
          >
            <span className="sm:hidden">Começar</span>
            <span className="hidden sm:inline">Começar Agora</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
