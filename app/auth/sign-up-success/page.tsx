import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 px-6">
      <Logo />
      <div className="w-full max-w-sm">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Conta criada!</CardTitle>
            <CardDescription>Verifique seu email para confirmar</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmacao para o seu email.
              Clique no link para ativar sua conta e comecar a usar a Cresci.IA.
            </p>
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
