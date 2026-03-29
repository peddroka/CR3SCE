import Link from "next/link";
import { Instagram, Mail, Youtube, Linkedin } from "lucide-react";
import { Logo } from "@/components/logo";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-4 md:py-20">
          <div className="flex flex-col gap-5 md:col-span-1">
            <Logo size="lg" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Planejamento de conteudo inteligente para Instagram. 30 dias
              prontos, todo mes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://instagram.com/cr3sce"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-white/5 text-muted-foreground transition-colors hover:border-lime/40 hover:text-lime"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://youtube.com/@cr3sce"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-white/5 text-muted-foreground transition-colors hover:border-lime/40 hover:text-lime"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href="https://linkedin.com/company/cr3sce"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-white/5 text-muted-foreground transition-colors hover:border-lime/40 hover:text-lime"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://tiktok.com/@cr3sce"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-white/5 text-muted-foreground transition-colors hover:border-lime/40 hover:text-lime"
              >
                <TikTokIcon className="size-4" />
              </a>
            </div>
            <a
              href="mailto:contato@cr3sce.com"
              className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-lime"
            >
              <Mail className="size-4" />
              contato@cr3sce.com
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Produto
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Como Funciona", href: "#como" },
                { label: "Cases de Sucesso", href: "#cases" },
                { label: "Depoimentos", href: "#depoimentos" },
                { label: "Perguntas Frequentes", href: "#faq" },
                { label: "Precos", href: "#preco" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-lime"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Empresa
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Sobre o CR3SCE", href: "#como" },
                { label: "Analise seu perfil", href: "/auth/sign-up" },
                { label: "Blog (em breve)", href: "#" },
                { label: "Afiliados (em breve)", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-lime"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Comece agora
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pare de improvisar. Tenha 30 dias de conteudo planejado todo mes.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-block w-fit border border-white/10 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-[#333333]"
            >
              Comecar agora {"->"}
            </Link>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-lime">+</span> Plano mensal: cancele
                quando quiser
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-lime">+</span> Plano anual: 2 meses
                gratis
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-lime">+</span> Garantia de 7 dias
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-lime">+</span> Resultado no primeiro mes
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            (c) {new Date().getFullYear()} CR3SCE. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">Feito no Brasil</p>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-xs text-muted-foreground transition-colors hover:text-lime"
            >
              Entrar
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-xs text-muted-foreground transition-colors hover:text-lime"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
