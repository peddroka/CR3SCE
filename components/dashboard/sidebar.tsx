"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Início",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/calendar",
      label: "Calendário",
      icon: CalendarDays,
    },
    {
      href: "/dashboard/chat",
      label: "Chat IA",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/evolution",
      label: "Evolução",
      icon: TrendingUp,
    },
    {
      href: "/dashboard/settings",
      label: "Configurações",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      {/* Mobile/Tablet header */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-primary/20 px-4 py-3 md:hidden"
        style={{ backgroundColor: "#07070B" }}
      >
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo-sidebar.png"
            alt="Cresci.IA"
            width={120}
            height={40}
            priority
            quality={100}
            className="object-contain"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-primary/10"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-primary/10 transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        style={{ backgroundColor: "#07070B" }}
      >
        <ScrollArea className="h-full py-6">
          <div className="px-4">
            {/* Logo - visível apenas quando sidebar está aberta no mobile/tablet */}
            <Link
              href="/dashboard"
              className="flex items-center justify-center mb-8 mt-12 md:mt-0"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/logo-sidebar.png"
                alt="Cresci.IA"
                width={160}
                height={53}
                priority
                quality={100}
                className="object-contain"
              />
            </Link>

            {/* Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-sm font-normal hover:bg-primary/10",
                        isActive && "bg-primary/10 text-primary",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Sign out */}
            <div className="absolute bottom-6 left-4 right-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground border border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-all"
              >
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
