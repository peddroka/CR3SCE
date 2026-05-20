import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/lgpd/cookie-consent-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CR3SCE - Planejamento de Conteudo para Instagram",
  description: "R$79,90/mes. 30 dias de conteudo planejado para o Instagram.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
