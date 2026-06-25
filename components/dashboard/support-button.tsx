"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PEDRO_WHATSAPP = "5582988543864";
const ARTHUR_WHATSAPP = "5582993226033";

const SUPPORT_SYSTEM_INFO = `Você é o assistente de suporte do CR3SCE — plataforma de planejamento de conteúdo para Instagram.

REGRAS CRÍTICAS:
1. NUNCA mencione números de WhatsApp ou contato humano nas primeiras mensagens
2. Tente resolver o problema com no mínimo 3-4 respostas antes de considerar escalar
3. Só forneça contato humano se o usuário insistir MUITO (pedir 3+ vezes ou ficar claramente frustrado)
4. Quando finalmente der o contato, dê os dois: Pedro (82) 98854-3864 e Arthur (82) 99322-6033

SOBRE O CR3SCE:
- Plataforma SaaS de R$79,90/mês que gera calendários de conteúdo para Instagram
- Gera 30 dias de posts com roteiro, horário e hashtags personalizados
- Dashboard com calendário, chat IA, evolução e configurações

FUNCIONALIDADES:
- Calendário: clique em um dia para ver os posts. Botão verde "Marcar como Concluído" salva o progresso.
- Chat IA: tire dúvidas de marketing. Persiste por 24 horas.
- Evolução: acompanhe missões e sequência de postagens.
- Configurações: edite informações do negócio.

ERROS COMUNS:
- "Não está salvando": clique no botão verde dentro do post
- "Chat sumindo": limpo automaticamente após 24h
- "Erro 500": aguarde 1 minuto e tente novamente
- "Estratégia não gerou": verifique conexão e tente pelo dashboard

Responda de forma curta e direta. Sempre em português.

NÚMEROS INTERNOS:
- Pedro: ${PEDRO_WHATSAPP}
- Arthur: ${ARTHUR_WHATSAPP}`;

interface SupportMessage {
  role: "user" | "assistant";
  content: string;
}

export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o suporte do CR3SCE. Como posso ajudar você hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: SupportMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          systemOverride: SUPPORT_SYSTEM_INFO,
        }),
      });

      if (!response.ok) throw new Error("Erro");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "text-delta" && parsed.delta) {
                content += parsed.delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, tive um problema técnico agora. Tente novamente em instantes que eu continuo te ajudando por aqui.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[150]">
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-[#C8F135]/30"
          />
        )}

        <AnimatePresence>
          {!open && (
            <motion.button
              id="support-button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#C8F135] text-[#111] shadow-lg shadow-[#C8F135]/20 transition-colors hover:bg-[#a8d020]"
              title="Suporte CR3SCE"
            >
              <MessageCircle className="size-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.88, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-4 z-[150] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ transformOrigin: "bottom right" }}
          >
            <div className="flex items-center justify-between border-b border-border bg-[#C8F135]/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#C8F135]/20">
                  <Sparkles className="size-4 text-[#C8F135]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Suporte CR3SCE
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-[10px] text-[#666]">online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[#666] transition-colors hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={messagesRef}
              className="flex h-64 flex-col gap-2 overflow-y-auto p-3"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}`}
                  initial={{
                    opacity: 0,
                    x: msg.role === "user" ? 20 : -20,
                    y: 8,
                  }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`max-w-[85%] break-words rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C8F135]/15 text-[#c0c0c0]"
                        : "border border-border bg-background/80 text-[#c0c0c0]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-row gap-2"
                >
                  <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-2.5">
                    {[0, 150, 300].map((delay) => (
                      <motion.span
                        key={delay}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: delay / 1000,
                        }}
                        className="block size-1.5 rounded-full bg-[#C8F135]/60"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  className="h-9 flex-1 border-border bg-white/5 text-xs text-white placeholder:text-[#444]"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="h-9 w-9 bg-[#C8F135] text-[#111] hover:bg-[#a8d020]"
                >
                  <Send className="size-3" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
