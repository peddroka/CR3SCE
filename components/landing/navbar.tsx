"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["como", "pilares", "cases", "depoimentos", "preco"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Como Funciona", id: "como" },
    { label: "Por que o 3?", id: "pilares" },
    { label: "Cases", id: "cases" },
    { label: "Depoimentos", id: "depoimentos" },
    { label: "Preços", id: "preco" },
  ];

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/95 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20 md:px-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Logo size="lg" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden items-center gap-10 md:flex"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={cn(
                "relative py-1 text-sm transition-all duration-300",
                activeSection === item.id
                  ? "text-lime"
                  : "text-muted-foreground hover:text-white",
              )}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="hidden items-center gap-3 md:flex"
        >
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-4 py-2 text-sm text-[#c0c0c0] transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg border border-white/10 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#333333]"
          >
            Começar Agora
          </Link>
        </motion.div>

        <button
          className="p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border bg-card px-6 pb-4 md:hidden"
          >
            <div className="flex flex-col gap-1 pt-4">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-left text-sm transition-colors",
                    activeSection === item.id
                      ? "bg-white/10 text-lime"
                      : "text-[#c0c0c0] hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-border py-2.5 text-center text-sm text-[#c0c0c0]"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/10 bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
