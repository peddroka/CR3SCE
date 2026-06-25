"use client";

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

export type PostPalette = {
  name?: string;
  hex?: string;
  role?: string;
};

export type PostPreviewData = {
  format: "single" | "carousel" | "reel";
  caption: { hook: string; body: string; cta: string };
  carousel_slides?: {
    number?: number;
    title?: string;
    body?: string;
    visual_direction?: string;
  }[];
  visual_brief: {
    layout_template?:
      | "typography_oversized"
      | "side_block"
      | "asymmetric_brutal"
      | "frame_card"
      | "swiss_grid";
    palette?: PostPalette[];
  };
};

type Colors = {
  fundo: string;
  texto: string;
  destaque: string;
  secundaria: string;
};

function pickColors(palette?: PostPalette[]): Colors {
  const defaults: Colors = {
    fundo: "#0F0F10",
    texto: "#FAFAFA",
    destaque: "#C8F135",
    secundaria: "#666666",
  };
  if (!palette || palette.length === 0) return defaults;

  const byRole: Record<string, string> = {};
  for (const item of palette) {
    if (item.role && item.hex) byRole[item.role.toLowerCase()] = item.hex;
  }
  // Se vier sem role explicito, distribui por ordem
  if (Object.keys(byRole).length === 0) {
    palette.forEach((item, idx) => {
      if (!item.hex) return;
      if (idx === 0) byRole.fundo = item.hex;
      else if (idx === 1) byRole.texto = item.hex;
      else if (idx === 2) byRole.destaque = item.hex;
      else if (idx === 3) byRole.secundaria = item.hex;
    });
  }

  return {
    fundo: byRole.fundo || defaults.fundo,
    texto: byRole.texto || defaults.texto,
    destaque: byRole.destaque || defaults.destaque,
    secundaria: byRole.secundaria || defaults.secundaria,
  };
}

// Tamanhos escalam com a largura do container (cqw) usando ~420px como referência,
// para a prévia não estourar/cortar em telas estreitas. clamp() preserva a proporção
// original no desktop e impede que fique grande demais.
function hookFontSize(text: string): string {
  const len = text.trim().length;
  if (len < 24) return "clamp(40px, 20cqw, 84px)";
  if (len < 48) return "clamp(32px, 15.2cqw, 64px)";
  if (len < 80) return "clamp(24px, 11.4cqw, 48px)";
  if (len < 120) return "clamp(20px, 8.6cqw, 36px)";
  return "clamp(16px, 6.7cqw, 28px)";
}

function slideTitleSize(text: string): string {
  const len = text.trim().length;
  if (len < 24) return "clamp(24px, 10.5cqw, 44px)";
  if (len < 48) return "clamp(18px, 7.6cqw, 32px)";
  return "clamp(16px, 5.7cqw, 24px)";
}

type Props = {
  post: PostPreviewData;
  slideIndex?: number;
  instagramHandle?: string;
  totalSlides?: number;
  className?: string;
};

export const PostPreview = forwardRef<HTMLDivElement, Props>(function PostPreview(
  { post, slideIndex = 0, instagramHandle, totalSlides, className },
  ref,
) {
  const colors = useMemo(
    () => pickColors(post.visual_brief?.palette),
    [post.visual_brief?.palette],
  );

  const isCover = slideIndex === 0;
  const carouselSlide = !isCover ? post.carousel_slides?.[slideIndex - 1] : undefined;
  const layout = post.visual_brief?.layout_template || "typography_oversized";

  const displayText = isCover
    ? post.caption.hook
    : carouselSlide?.body || carouselSlide?.title || "";
  const displayTitle = isCover ? undefined : carouselSlide?.title;
  const slideNumber = !isCover && carouselSlide?.number
    ? carouselSlide.number
    : slideIndex;

  const handle = instagramHandle ? `@${instagramHandle.replace("@", "")}` : "";

  // Wrapper compartilhado: 4:5 ratio, fontes carregadas, sem overflow
  const containerStyle = {
    backgroundColor: colors.fundo,
    color: colors.texto,
    aspectRatio: "4 / 5",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    containerType: "inline-size",
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        "border border-white/5 shadow-xl",
        className,
      )}
      style={containerStyle}
      data-post-preview
    >
      {/* Indicador de formato no topo */}
      <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em]">
        <span
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: colors.destaque, color: colors.fundo }}
        >
          {post.format === "carousel"
            ? `${String(slideNumber).padStart(2, "0")}/${String(totalSlides ?? post.carousel_slides?.length ?? 1).padStart(2, "0")}`
            : post.format === "reel"
              ? "REEL"
              : "POST"}
        </span>
        {handle && (
          <span style={{ color: colors.secundaria, opacity: 0.85 }}>{handle}</span>
        )}
      </div>

      {layout === "typography_oversized" && (
        <LayoutTypographyOversized
          colors={colors}
          mainText={displayText}
          subTitle={displayTitle}
          isCover={isCover}
        />
      )}
      {layout === "side_block" && (
        <LayoutSideBlock
          colors={colors}
          mainText={displayText}
          subTitle={displayTitle}
          isCover={isCover}
        />
      )}
      {layout === "asymmetric_brutal" && (
        <LayoutAsymmetricBrutal
          colors={colors}
          mainText={displayText}
          subTitle={displayTitle}
          isCover={isCover}
        />
      )}
      {layout === "frame_card" && (
        <LayoutFrameCard
          colors={colors}
          mainText={displayText}
          subTitle={displayTitle}
          isCover={isCover}
        />
      )}
      {layout === "swiss_grid" && (
        <LayoutSwissGrid
          colors={colors}
          mainText={displayText}
          subTitle={displayTitle}
          isCover={isCover}
        />
      )}

      {/* CTA / proximo slide hint no rodape */}
      <div
        className="absolute bottom-5 left-5 right-5 z-20 flex items-end justify-between text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: colors.texto, opacity: 0.85 }}
      >
        {isCover ? (
          <>
            <span className="max-w-[60%] leading-snug">{post.caption.cta}</span>
            {post.format === "carousel" && (
              <span style={{ color: colors.destaque }}>arraste &rarr;</span>
            )}
          </>
        ) : (
          <>
            <span style={{ color: colors.secundaria }}>cont.</span>
            {totalSlides && slideIndex < totalSlides - 1 && (
              <span style={{ color: colors.destaque }}>arraste &rarr;</span>
            )}
          </>
        )}
      </div>
    </div>
  );
});

// ===== LAYOUT 1: Tipografia gigante centralizada =====
function LayoutTypographyOversized({
  colors,
  mainText,
  subTitle,
  isCover,
}: {
  colors: Colors;
  mainText: string;
  subTitle?: string;
  isCover: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 pt-16 pb-16">
      {subTitle && (
        <p
          className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: colors.destaque }}
        >
          {subTitle}
        </p>
      )}
      <h2
        className="text-center font-bebas leading-[0.95] tracking-tight"
        style={{
          fontFamily: "var(--font-bebas), Impact, sans-serif",
          fontSize: isCover ? hookFontSize(mainText) : slideTitleSize(mainText),
          color: colors.texto,
        }}
      >
        {mainText}
      </h2>
      {isCover && (
        <div
          className="mt-8 h-1 w-16"
          style={{ backgroundColor: colors.destaque }}
        />
      )}
    </div>
  );
}

// ===== LAYOUT 2: Side block (split 50/50) =====
function LayoutSideBlock({
  colors,
  mainText,
  subTitle,
  isCover,
}: {
  colors: Colors;
  mainText: string;
  subTitle?: string;
  isCover: boolean;
}) {
  return (
    <div className="absolute inset-0 grid grid-cols-2">
      <div
        className="flex items-center justify-center p-6"
        style={{ backgroundColor: colors.destaque }}
      >
        <div
          className="h-24 w-24 rounded-full"
          style={{
            backgroundColor: colors.fundo,
            border: `8px solid ${colors.secundaria}`,
          }}
        />
      </div>
      <div className="flex flex-col justify-center px-6 pt-16 pb-16">
        {subTitle && (
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: colors.destaque }}
          >
            {subTitle}
          </p>
        )}
        <h2
          className="font-bebas leading-[0.95] tracking-tight"
          style={{
            fontFamily: "var(--font-bebas), Impact, sans-serif",
            fontSize: isCover ? hookFontSize(mainText) : slideTitleSize(mainText),
            color: colors.texto,
          }}
        >
          {mainText}
        </h2>
      </div>
    </div>
  );
}

// ===== LAYOUT 3: Asymmetric brutalist =====
function LayoutAsymmetricBrutal({
  colors,
  mainText,
  subTitle,
  isCover,
}: {
  colors: Colors;
  mainText: string;
  subTitle?: string;
  isCover: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-90"
        style={{ backgroundColor: colors.destaque }}
      />
      <div
        className="absolute -left-8 bottom-16 h-32 w-32 rotate-12"
        style={{ backgroundColor: colors.secundaria, opacity: 0.4 }}
      />
      <div className="absolute inset-0 flex items-end px-7 pb-20 pt-16">
        <div className="relative z-10">
          {subTitle && (
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: colors.destaque }}
            >
              {subTitle}
            </p>
          )}
          <h2
            className="font-bebas leading-[0.9] tracking-tight"
            style={{
              fontFamily: "var(--font-bebas), Impact, sans-serif",
              fontSize: isCover ? hookFontSize(mainText) : slideTitleSize(mainText),
              color: colors.texto,
            }}
          >
            {mainText}
          </h2>
        </div>
      </div>
    </div>
  );
}

// ===== LAYOUT 4: Frame card =====
function LayoutFrameCard({
  colors,
  mainText,
  subTitle,
  isCover,
}: {
  colors: Colors;
  mainText: string;
  subTitle?: string;
  isCover: boolean;
}) {
  return (
    <div className="absolute inset-0 p-6 pt-14 pb-14">
      <div
        className="flex h-full flex-col items-center justify-center rounded-xl border-2 p-6 text-center"
        style={{
          borderColor: colors.destaque,
          backgroundColor: `${colors.destaque}10`,
        }}
      >
        {subTitle && (
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: colors.destaque }}
          >
            {subTitle}
          </p>
        )}
        <h2
          className="font-bebas leading-[0.95] tracking-tight"
          style={{
            fontFamily: "var(--font-bebas), Impact, sans-serif",
            fontSize: isCover ? hookFontSize(mainText) : slideTitleSize(mainText),
            color: colors.texto,
          }}
        >
          {mainText}
        </h2>
      </div>
    </div>
  );
}

// ===== LAYOUT 5: Swiss grid =====
function LayoutSwissGrid({
  colors,
  mainText,
  subTitle,
  isCover,
}: {
  colors: Colors;
  mainText: string;
  subTitle?: string;
  isCover: boolean;
}) {
  return (
    <div className="absolute inset-0 px-6 pt-16 pb-16">
      <div
        className="flex h-full flex-col justify-between border-t border-b py-6"
        style={{ borderColor: colors.secundaria }}
      >
        <div>
          {subTitle && (
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: colors.destaque }}
            >
              {subTitle}
            </p>
          )}
          <h2
            className="font-bebas leading-[0.9] tracking-tight"
            style={{
              fontFamily: "var(--font-bebas), Impact, sans-serif",
              fontSize: isCover ? hookFontSize(mainText) : slideTitleSize(mainText),
              color: colors.texto,
            }}
          >
            {mainText}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.destaque }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: colors.secundaria }}
          >
            índice / 01
          </span>
        </div>
      </div>
    </div>
  );
}
