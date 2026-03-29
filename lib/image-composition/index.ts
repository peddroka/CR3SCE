import sharp from "sharp";

const DIMENSIONS = {
  feed: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
} as const;

const STYLES = {
  dark: {
    overlay: [0, 0, 0, 180] as const,
    accent: "#C8F135",
    textColor: "#FFFFFF",
  },
  light: {
    overlay: [255, 255, 255, 120] as const,
    accent: "#1a1a2e",
    textColor: "#111111",
  },
  colorful: {
    overlay: [20, 20, 60, 160] as const,
    accent: "#FF6B6B",
    textColor: "#FFFFFF",
  },
  minimal: {
    overlay: [10, 10, 10, 200] as const,
    accent: "#FFFFFF",
    textColor: "#FFFFFF",
  },
} as const;

export type ComposeFormat = keyof typeof DIMENSIONS;
export type ComposeStyle = keyof typeof STYLES;

interface ComposeParams {
  bgUrl: string | null;
  elementUrl: string | null;
  format: ComposeFormat;
  style: ComposeStyle;
  business: {
    business_name: string;
    niche: string;
    brand_colors?: string[] | null;
    logo_url?: string | null;
  };
  visualPrompt: string;
  title?: string;
  subtitle?: string;
  cta?: string;
}

function ensureHexColor(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : null;
}

async function fetchBuffer(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = `${current} ${word}`.trim();
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function extractTitleFromPrompt(prompt: string) {
  const quoted = prompt.match(/"([^"]+)"/);
  if (quoted?.[1] && quoted[1].length <= 80) return quoted[1].trim();
  return "Conteúdo exclusivo";
}

function buildTextSVG({
  w,
  h,
  PAD,
  title,
  subtitle,
  cta,
  titleColor,
  ctaColor,
  textY,
}: {
  w: number;
  h: number;
  PAD: number;
  title: string;
  subtitle: string;
  cta: string;
  titleColor: string;
  ctaColor: string;
  textY: number;
}) {
  const titleLines = wrapText(title, 20);
  const titleFontSize = w >= 1080 ? 72 : 54;
  const subtitleFontSize = Math.round(titleFontSize * 0.45);
  const ctaFontSize = Math.round(titleFontSize * 0.38);
  const lineH = titleFontSize * 1.15;

  let titleSvg = "";
  titleLines.forEach((line, index) => {
    titleSvg += `<text x="${PAD}" y="${textY + index * lineH}" font-size="${titleFontSize}" font-weight="900" fill="${titleColor}" font-family="Arial Black, sans-serif" filter="url(#textShadow)">${escapeXml(line)}</text>`;
  });

  const afterTitleY = textY + titleLines.length * lineH + 20;
  const subtitleSvg = subtitle
    ? `<text x="${PAD}" y="${afterTitleY}" font-size="${subtitleFontSize}" font-weight="400" fill="${titleColor}" font-family="Arial, sans-serif" opacity="0.85" filter="url(#textShadow)">${escapeXml(subtitle)}</text>`
    : "";

  const ctaY = afterTitleY + (subtitle ? subtitleFontSize + 24 : 20);
  const ctaSvg = `<text x="${PAD}" y="${ctaY}" font-size="${ctaFontSize}" font-weight="700" fill="${ctaColor}" font-family="Arial, sans-serif" filter="url(#textShadow)">${escapeXml(cta)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <filter id="textShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.82" />
      </filter>
    </defs>
    ${titleSvg}
    ${subtitleSvg}
    ${ctaSvg}
  </svg>`;
}

async function createVignette(w: number, h: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="v" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="white" stop-opacity="1"/>
        <stop offset="100%" stop-color="black" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#v)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function createRichFallbackBackground(
  w: number,
  h: number,
  colors?: string[] | null,
  style?: ComposeStyle,
) {
  const c1 = ensureHexColor(colors?.[0]) || "#0d0d0d";
  const c2 = ensureHexColor(colors?.[1]) || "#1a1a2e";
  const accent =
    ensureHexColor(colors?.[0]) || (style ? STYLES[style].accent : "#C8F135");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="light1" cx="80%" cy="20%" r="40%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="light2" cx="20%" cy="80%" r="35%">
        <stop offset="0%" stop-color="${c2}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#light1)"/>
    <rect width="${w}" height="${h}" fill="url(#light2)"/>
  </svg>`;

  return sharp(Buffer.from(svg));
}

async function createOverlay(width: number, height: number, rgba: readonly [number, number, number, number]) {
  const [r, g, b, a] = rgba;
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha: a / 255 },
    },
  })
    .png()
    .toBuffer();
}

function deriveSubtitle(params: ComposeParams) {
  if (params.subtitle) return params.subtitle;
  return `${params.business.niche} com direção visual pensada para destacar a marca.`;
}

function deriveCta(params: ComposeParams) {
  if (params.cta) return params.cta;
  return "Siga para mais conteúdo";
}

export async function composeImage(params: ComposeParams): Promise<Buffer> {
  const { w, h } = DIMENSIONS[params.format];
  const style = STYLES[params.style];
  const PAD = Math.round(w * 0.1);
  const accentColor =
    ensureHexColor(params.business.brand_colors?.[0]) || style.accent;

  let base: sharp.Sharp;

  if (params.bgUrl) {
    try {
      const bgRes = await fetchBuffer(params.bgUrl);
      base = sharp(bgRes).resize(w, h, { fit: "cover", position: "center" }).blur(3);
    } catch {
      base = createRichFallbackBackground(
        w,
        h,
        params.business.brand_colors,
        params.style,
      );
    }
  } else {
    base = createRichFallbackBackground(
      w,
      h,
      params.business.brand_colors,
      params.style,
    );
  }

  const bgBuffer = await base.toBuffer();
  const composites: sharp.OverlayOptions[] = [];

  composites.push({
    input: await createOverlay(w, h, style.overlay),
    blend: "over",
  });

  composites.push({
    input: await createVignette(w, h),
    blend: "multiply",
  });

  if (params.elementUrl) {
    try {
      const elementBuffer = await fetchBuffer(params.elementUrl);
      const panelWidth = Math.round(w * 0.34);
      const panelHeight = Math.round(params.format === "feed" ? h * 0.42 : h * 0.28);
      const panelLeft = Math.round(w * 0.56);
      const panelTop = Math.round(h * 0.12);

      const elementResized = await sharp(elementBuffer)
        .resize(panelWidth, panelHeight, { fit: "cover", position: "center" })
        .png()
        .toBuffer();

      composites.push({
        input: elementResized,
        left: panelLeft,
        top: panelTop,
        blend: "over",
      });
    } catch {}
  }

  const titleText =
    params.title && params.title.trim().length > 0
      ? params.title.trim()
      : "Conteúdo exclusivo";
  const subtitleText = deriveSubtitle(params);
  const ctaText = deriveCta(params);
  const textY = params.format === "feed" ? Math.round(h * 0.55) : Math.round(h * 0.66);

  composites.push({
    input: Buffer.from(
      buildTextSVG({
        w,
        h,
        PAD,
        title: titleText,
        subtitle: subtitleText,
        cta: ctaText,
        titleColor: style.textColor,
        ctaColor: accentColor,
        textY,
      }),
    ),
    blend: "over",
    top: 0,
    left: 0,
  });

  if (params.business.logo_url) {
    try {
      const logoBuffer = await fetchBuffer(params.business.logo_url);
      const logoResized = await sharp(logoBuffer)
        .resize(Math.round(w * 0.12), null, { fit: "inside" })
        .png()
        .toBuffer();

      composites.push({
        input: logoResized,
        left: PAD,
        top: h - PAD - 60,
        blend: "over",
      });
    } catch {}
  }

  return sharp(bgBuffer)
    .composite(composites)
    .jpeg({ quality: 92 })
    .toBuffer();
}
