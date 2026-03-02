import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 px-6">
      <Logo />
      <div className="w-full max-w-sm">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Algo deu errado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">
                Erro: {params.error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro inesperado. Tente novamente.
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
