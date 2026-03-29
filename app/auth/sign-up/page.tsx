"use client";

import { createClient, resetSupabaseBrowserSession } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const ONBOARDING_DRAFT_PREFIX = "cr3sce_onboarding_draft";

function clearOnboardingDrafts() {
  if (typeof window === "undefined") return;

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(ONBOARDING_DRAFT_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {}
}

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    let shouldResetLoading = true;

    const normalizedEmail = email.trim().toLowerCase();

    if (password !== repeatPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      clearOnboardingDrafts();
      await resetSupabaseBrowserSession();
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Este email já está cadastrado. Tente fazer login.");
          setIsLoading(false);
          return;
        }
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Erro ao criar conta. Tente novamente.");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Conta criada! Verifique seu email para confirmar antes de entrar. Ou desative a confirmação de email no Supabase Dashboard -> Authentication -> Settings.",
          );
          setIsLoading(false);
          return;
        }
        throw signInError;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      shouldResetLoading = false;
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro ao criar a conta.",
      );
    } finally {
      if (shouldResetLoading) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background">
        <div className="flex items-center gap-0">
          {/* C */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0, duration: 0.4 }}
          >
            C
          </motion.span>
          {/* R */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            R
          </motion.span>
          {/* 3 */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-[#C8F135]"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 300,
            }}
          >
            3
          </motion.span>
          {/* S */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            S
          </motion.span>
          {/* C */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            C
          </motion.span>
          {/* E */}
          <motion.span
            className="font-bebas text-[72px] leading-none text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            E
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="size-2 rounded-full bg-[#C8F135]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Criando sua conta...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#C8F135]/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#C8F135]/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          <Link href="/">
            <Logo size="xl" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first-name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="João"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 border-border bg-background/50 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Silva"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 border-border bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="Repita a senha"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-11 border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full gap-2 bg-[#C8F135] text-base font-semibold text-[#111] hover:bg-[#a8d020]"
            >
              <>
                Criar conta
                <ArrowRight className="size-5" />
              </>
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#C8F135] hover:underline"
            >
              Entrar
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
