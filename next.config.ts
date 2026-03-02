// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Define o diretório raiz explicitamente
    root: path.resolve(__dirname),
  },
  // Desabilita a verificação de tipos durante o build (opcional)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configurações de imagens
  images: {
    domains: ["localhost", "wzxwbwharybtbkfhlnsg.supabase.co"],
  },
};

export default nextConfig;
