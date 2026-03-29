"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Senha incorreta.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <Logo size="xl" />
        <div className="w-full rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-white/5">
              <Lock className="size-6 text-[#C8F135]" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Área Administrativa
            </h1>
            <p className="text-xs text-[#666]">Acesso restrito</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-border bg-white/5 text-white"
              required
            />
            {error && (
              <p className="text-center text-xs text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 bg-[#C8F135] font-semibold text-[#111] hover:bg-[#a8d020]"
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
