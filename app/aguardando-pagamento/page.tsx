"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { createClient, getUserSafely } from "@/lib/supabase/client";

export default function AguardandoPagamentoPage() {
  const [paid, setPaid] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let shouldStopPolling = false;

    const checkPayment = async () => {
      try {
        const response = await fetch("/api/payment-status", {
          cache: "no-store",
        });
        const result = (await response.json()) as {
          authenticated?: boolean;
          status?: string;
        };

        if (!result.authenticated) {
          router.push("/auth/login");
          return;
        }

        if (result.status === "unconfigured") {
          shouldStopPolling = true;
          setPaymentError(
            "Não consegui validar o pagamento no Supabase. Rode o SQL de pagamentos e depois recarregue a página.",
          );
          return;
        }

        if (result.status === "paid") {
          setPaymentError(null);
          setPaid(true);
          window.setTimeout(() => router.push("/dashboard"), 2500);
          return;
        }

        setCheckCount((prev) => prev + 1);
      } catch (error) {
        shouldStopPolling = true;
        console.error("Erro ao verificar pagamento:", error);
        setPaymentError(
          "Não foi possível verificar o pagamento agora. Confira o Supabase e tente novamente.",
        );
      }
    };

    void checkPayment();
    const interval = window.setInterval(() => {
      if (!shouldStopPolling) {
        void checkPayment();
      }
    }, 5000);

    return () => {
      shouldStopPolling = true;
      window.clearInterval(interval);
    };
  }, [router]);

  const handleGoToCheckout = async () => {
    const supabase = createClient();
    const { user } = await getUserSafely(supabase);
    const checkoutBaseUrl = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!checkoutBaseUrl) {
      return;
    }

    const checkoutUrl = `${checkoutBaseUrl}?email=${encodeURIComponent(user?.email || "")}`;
    window.location.href = checkoutUrl;
  };

  const steps = paymentError
    ? [
        "Abra o arquivo scripts/006_add_cakto_payments.sql no projeto.",
        "Rode esse SQL no SQL Editor do Supabase.",
        "Confirme que a coluna payment_status existe em profiles.",
        "Recarregue esta página para retomar a validação.",
      ]
    : [
        "Clique no botão abaixo para ir ao checkout.",
        "Complete o pagamento de R$79,90 por mês.",
        "Esta página detecta o pagamento automaticamente.",
        "Você é redirecionado para o painel sem precisar fazer nada.",
      ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,241,53,0.05)_0%,transparent_65%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-8"
      >
        <Logo size="lg" />

        {paid ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#C8F135]/40 bg-[#C8F135]/10">
              <CheckCircle2 className="size-12 text-[#C8F135]" />
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                Pagamento confirmado!
              </h1>
              <p className="text-sm text-[#888]">
                Bem-vindo ao CR3SCE. Redirecionando para o seu painel...
              </p>
            </div>
            <Loader2 className="size-5 animate-spin text-[#C8F135]" />
          </motion.div>
        ) : (
          <div className="flex w-full flex-col items-center gap-6">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white/5">
                {paymentError ? (
                  <RefreshCw className="size-7 text-[#C8F135]" />
                ) : (
                  <Loader2 className="size-7 animate-spin text-[#C8F135]" />
                )}
              </div>
              {checkCount > 0 && !paymentError && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 text-[9px] font-bold text-[#C8F135]">
                  {checkCount}
                </span>
              )}
            </div>

            <div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                {paymentError
                  ? "Configuração de pagamento pendente"
                  : "Finalize seu pagamento"}
              </h1>
              <p className="max-w-xs text-sm leading-relaxed text-[#888]">
                {paymentError
                  ? paymentError
                  : "Sua conta foi criada. Complete o pagamento de R$79,90 para ativar o acesso ao CR3SCE."}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                {paymentError ? "Próximo passo" : "Como funciona"}
              </p>
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 text-[9px] font-bold text-[#C8F135]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#c0c0c0]">{step}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGoToCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8F135] py-4 text-sm font-bold uppercase tracking-wider text-[#111] transition-all hover:-translate-y-0.5 hover:bg-[#a8d020] hover:shadow-[0_12px_40px_rgba(200,241,53,0.2)]"
            >
              <ExternalLink className="size-4" />
              Ir para o Checkout - R$79,90/mês
            </button>

            <p className="flex items-center gap-1.5 text-xs text-[#444]">
              <RefreshCw
                className={paymentError ? "size-3" : "size-3 animate-spin"}
              />
              {paymentError
                ? "A validação automática foi pausada até o Supabase ser configurado."
                : "Verificando pagamento automaticamente..."}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
