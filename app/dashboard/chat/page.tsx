"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AIDisclosureNotice } from "@/components/lgpd/ai-disclosure-notice";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) {
      return;
    }

    setError(false);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao conectar com o chat");
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
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("0:")) {
              try {
                const textDelta = JSON.parse(line.slice(2)) as string;
                assistantContent += textDelta;
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === assistantId
                      ? { ...message, content: assistantContent }
                      : message,
                  ),
                );
              } catch {}
            }
          }
        }
      }
    } catch (sendError) {
      console.error("Erro ao enviar mensagem do chat:", sendError);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (error && messages.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <div className="text-destructive">Erro ao conectar com o chat</div>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Sparkles className="size-6 shrink-0 text-[#C8F135]" />
            Assistente CR3SCE
          </h1>
          <p className="mt-1 text-sm text-[#666]">
            Especialista no seu negócio - tem acesso ao seu calendário e
            estratégia.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-[#888]">online</span>
        </div>
      </div>

      <AIDisclosureNotice />

      <Card className="flex flex-1 flex-col overflow-hidden border-border/50">
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#C8F135]/10">
                  <Sparkles className="size-6 text-[#C8F135]" />
                </div>
                <h3 className="font-semibold text-white">
                  Olá! Sou o assistente CR3SCE
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Posso ajudar com ideias de conteúdo, estratégias de marketing,
                  análise de concorrentes e muito mais. Como posso ajudar?
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {[
                    "Como melhorar meu engajamento?",
                    "Ideias de Reels para essa semana",
                    "Melhor horário para postar",
                    "O que postar amanhã?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        void sendMessage(suggestion);
                      }}
                      className="rounded-lg border border-border/50 bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    message.role === "user"
                      ? "bg-white/10"
                      : "bg-[#C8F135]/10",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="size-4 text-white" />
                  ) : (
                    <Sparkles className="size-4 text-[#C8F135]" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-white/10 text-white"
                      : "border border-border bg-card text-[#c0c0c0]",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C8F135]/10">
                    <Sparkles className="size-4 text-[#C8F135]" />
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-3">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-[#C8F135] text-[#111] hover:bg-[#a8d020]"
            >
              <Send className="size-4" />
              <span className="sr-only">Enviar mensagem</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
