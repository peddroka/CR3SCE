import Link from "next/link";
import { Logo } from "@/components/logo";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-secondary/30 py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Logo e descrição */}
          <div className="col-span-1 lg:col-span-2">
            <Logo className="text-xl sm:text-2xl" />
            <p className="mt-3 sm:mt-4 max-w-md text-xs sm:text-sm text-muted-foreground">
              Transforme seu marketing digital com inteligência artificial.
              Estratégias personalizadas para fazer seu negócio crescer.
            </p>
            <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Facebook className="size-4 sm:size-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Instagram className="size-4 sm:size-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Twitter className="size-4 sm:size-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Linkedin className="size-4 sm:size-5" />
              </a>
            </div>
          </div>

          {/* Links - Produto */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Produto
            </h3>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3">
              <li>
                <Link
                  href="#como-funciona"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="#recursos"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  href="#precos"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Empresa */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Empresa
            </h3>
            <ul className="mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3">
              <li>
                <Link
                  href="/sobre"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary/10">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cresci.ai. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
