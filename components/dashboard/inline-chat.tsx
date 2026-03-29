"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CHAT_TTL_MS = 24 * 60 * 60 * 1000;

function getChatKey(userId: string) {
  return `cr3sce_chat_${userId}`;
}

function getExpiryKey(userId: string) {
  return `cr3sce_chat_expiry_${userId}`;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function loadSavedMessages(userId: string): ChatMessage[] {
  try {
    const expiry = localStorage.getItem(getExpiryKey(userId));
    if (expiry && Date.now() > Number(expiry)) {
      localStorage.removeItem(getChatKey(userId));
      localStorage.removeItem(getExpiryKey(userId));
      return [];
    }

    const saved = localStorage.getItem(getChatKey(userId));
    return saved ? (JSON.parse(saved) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[], userId: string) {
  try {
    localStorage.setItem(getChatKey(userId), JSON.stringify(messages));
    if (!localStorage.getItem(getExpiryKey(userId))) {
      localStorage.setItem(
        getExpiryKey(userId),
        String(Date.now() + CHAT_TTL_MS),
      );
    }
  } catch {}
}

function formatAIMessage(content: string): React.ReactNode {
  const cleaned = content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .trim();

  const paragraphs = cleaned.split(/\n\n+/);
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n").filter((line) => line.trim());
        return (
          <div key={index}>
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className={lineIndex > 0 ? "mt-1.5" : ""}>
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface InlineChatProps {
  businessName?: string;
  niche?: string;
  mainGoal?: string;
  platforms?: string;
  userId?: string;
}

export function InlineChat({
  businessName,
  niche,
  mainGoal,
  platforms,
  userId = "anonymous",
}: InlineChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages(loadSavedMessages(userId));
  }, [userId]);

  useEffect(() => {
    const element = scrollAreaRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages, userId);
    }
  }, [messages, userId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("Erro na API");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

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
                assistantContent += parsed.delta;
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === assistantId
                      ? { ...message, content: assistantContent }
                      : message,
                  ),
                );
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(getChatKey(userId));
      localStorage.removeItem(getExpiryKey(userId));
    } catch {}
  };

  const growthIntent =
    mainGoal === "visualizacao"
      ? "aumentar visualizacao"
      : mainGoal === "identidade"
        ? "construir identidade"
        : mainGoal === "vendas"
      ? "aumentar vendas"
      : mainGoal === "seguidores"
        ? "ganhar seguidores"
        : mainGoal === "engajamento"
          ? "aumentar engajamento"
          : "crescer";

  const suggestions = [
    `Ideia de Reels para ${niche || "o seu nicho"}`,
    "Que conteudo postar amanha?",
    `Como viralizar no ${platforms === "instagram" ? "Instagram" : "TikTok"}`,
    `Dica para ${growthIntent}`,
  ];

  return (
    <Card
      id="inline-chat-section"
      className="rounded-xl border border-border bg-card"
    >
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex size-8 items-center justify-center rounded-lg border border-lime/20 bg-lime/10">
              <Sparkles className="size-4 text-lime" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sua IA Pessoal</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] text-[#666]">
                  sempre disponivel para ajudar
                </span>
              </div>
            </div>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-5 pb-5">
        <div
          ref={scrollAreaRef}
          className="h-140 overflow-y-auto rounded-xl border border-border bg-background/50 p-3"
        >
          <div className="flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-lime/10">
                  <Sparkles className="size-5 text-lime" />
                </div>
                <p className="text-sm font-medium text-white">
                  Ola
                  {businessName
                    ? `, como posso ajudar o ${businessName}?`
                    : "! Como posso ajudar?"}
                </p>
                <p className="max-w-xs text-xs leading-relaxed text-[#666]">
                  Fale sobre ideias de conteudo, estrategias de crescimento e
                  duvidas de marketing. Estou aqui.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{
                  opacity: 0,
                  x: message.role === "user" ? 16 : -16,
                  y: 6,
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    message.role === "user" ? "bg-white/10" : "bg-lime/10",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="size-3 text-[#c0c0c0]" />
                  ) : (
                    <Sparkles className="size-3 text-lime" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                    message.role === "user"
                      ? "border border-[#C8F135]/20 bg-[#C8F135]/15 text-[#d0d0d0]"
                      : "border border-border bg-card text-[#c0c0c0]",
                  )}
                >
                  {message.role === "assistant" ? (
                    formatAIMessage(message.content)
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-lime/10">
                    <Sparkles className="size-3 text-lime" />
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2">
                    <span className="size-1.5 animate-bounce rounded-full bg-[#666] [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-[#666] [animation-delay:150ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-[#666] [animation-delay:300ms]" />
                  </div>
                </div>
              )}
          </div>
        </div>

        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                whileHover={{ scale: 1.02, borderColor: "rgba(200,241,53,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => void sendMessage(suggestion)}
                className="rounded-lg border border-border bg-white/5 px-3 py-2 text-left text-xs text-[#888] transition-colors hover:bg-white/10 hover:text-white"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo sobre seu negocio..."
            className="h-10 flex-1 border-border bg-white/5 text-sm text-white placeholder:text-[#444] focus-visible:border-lime/50"
            disabled={isLoading}
          />
          {messages.length > 0 && (
            <Button
              type="button"
              size="icon"
              onClick={handleClearChat}
              className="h-10 w-10 shrink-0 border border-border bg-white/5 text-[#666] hover:bg-destructive/10 hover:text-destructive"
              title="Limpar conversa"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime text-lime-foreground transition-colors hover:bg-lime/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-3.5" />
          </motion.button>
        </form>
      </CardContent>
    </Card>
  );
}
