"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Se houver erro, mostra mensagem amigável
  if (error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <div className="text-destructive">Erro ao conectar com o chat</div>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:h-[calc(100vh-4rem)]">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="size-6 text-primary" />
          Chat com a IA
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tire dúvidas sobre marketing, peça sugestões e refine suas
          estratégias.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/50">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold">Olá! Sou a Cresci.IA</h3>
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
                        // Simula o preenchimento do input
                        const input =
                          document.querySelector<HTMLInputElement>(
                            "#chat-input",
                          );
                        if (input) {
                          input.value = suggestion;
                          input.dispatchEvent(
                            new Event("input", { bubbles: true }),
                          );
                        }
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
                    message.role === "user" ? "bg-secondary" : "bg-primary/10",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="size-4 text-secondary-foreground" />
                  ) : (
                    <Sparkles className="size-4 text-primary" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-secondary px-4 py-3">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border/50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
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
