import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-[#C8F135]">404</p>
      <h1 className="text-3xl font-bold text-foreground">
        Pagina nao encontrada
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        A pagina que voce tentou abrir nao existe ou foi movida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[#C8F135] px-5 py-2.5 font-semibold text-[#111] transition-colors hover:bg-[#a8d020]"
      >
        Voltar para o inicio
      </Link>
    </div>
  );
}
