import Link from "next/link";
import { Logo } from "@/components/logo";
import { Footer } from "@/components/landing/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6 md:h-20">
          <Link href="/" aria-label="Voltar a pagina inicial">
            <Logo size="lg" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/auth/login"
              className="text-muted-foreground transition-colors hover:text-lime"
            >
              Entrar
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border border-white/10 bg-primary px-4 py-2 font-semibold text-primary-foreground transition-all hover:bg-[#333]"
            >
              Comecar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:py-16">
        <article className="space-y-4 text-base leading-relaxed text-muted-foreground [&_a]:text-lime [&_a:hover]:underline [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:md:text-4xl [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:md:text-2xl [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_table]:my-4 [&_table]:w-full [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-card [&_th]:p-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:text-sm">
          {children}
        </article>

        <nav className="mt-16 flex flex-wrap gap-4 border-t border-border pt-8 text-sm">
          <Link
            href="/politica-de-privacidade"
            className="text-muted-foreground transition-colors hover:text-lime"
          >
            Politica de Privacidade
          </Link>
          <Link
            href="/termos-de-uso"
            className="text-muted-foreground transition-colors hover:text-lime"
          >
            Termos de Uso
          </Link>
          <Link
            href="/politica-de-cookies"
            className="text-muted-foreground transition-colors hover:text-lime"
          >
            Politica de Cookies
          </Link>
        </nav>
      </main>

      <Footer />
    </div>
  );
}
