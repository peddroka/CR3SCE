import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({
  className,
  width = 120,
  height = 40,
  showText = true,
}: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-1", className)}>
      {/* Ícone/Logo Mark */}
      <div
        className="flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 rounded-md"
        style={{ width: height, height: height }}
      >
        <span className="text-white font-bold text-lg">C</span>
      </div>

      {/* Texto do Logo (opcional, para versões simplificadas) */}
      {showText && (
        <span className="font-bold text-xl">
          <span className="text-primary">Cresci.</span>
          <span className="text-purple-600">IA</span>
        </span>
      )}
    </Link>
  );
}
