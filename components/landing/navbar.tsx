"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Recursos", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Preços", href: "#pricing" },
    { label: "Contato", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo da Navbar - versão para fundo claro/transparente */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-navbar.png"
            alt="Cresci.IA"
            width={110}
            height={36}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/auth/signup">Começar Grátis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute left-0 right-0 top-16 border-b border-primary/10 bg-background p-4 transition-all duration-200 md:hidden",
            isOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none",
          )}
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-primary/10">
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/auth/signup">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
