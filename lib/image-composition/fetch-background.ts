const KEYWORD_NOISE =
  /ultra realistic|studio lighting|bokeh|cinematic|format|square|1:1|9:16|dark|light|blur|overlay|professional|photography|advertising|social media|campaign|negative space|dramatic|premium|editorial|branded|composition|palette|inspired|designed|brazilian|small business/gi;

const FALLBACK_BACKGROUND_PALETTES = [
  ["#0d0d0d", "#1a1a2e", "#C8F135"],
  ["#101820", "#1b4965", "#62b6cb"],
  ["#1f1c2c", "#302b63", "#f6c90e"],
  ["#0b132b", "#1c2541", "#5bc0be"],
  ["#1b1b1b", "#3a506b", "#f4d35e"],
  ["#111111", "#2d1e2f", "#e76f51"],
] as const;

function uniqueUrls(urls: Array<string | null | undefined>) {
  return Array.from(new Set(urls.filter(Boolean) as string[]));
}

function buildFallbackBackgroundOption(
  colors: readonly [string, string, string],
  orientation: "squarish" | "portrait",
) {
  const width = orientation === "portrait" ? 1080 : 1080;
  const height = orientation === "portrait" ? 1920 : 1080;
  const [base, secondary, accent] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${base}" />
        <stop offset="100%" stop-color="${secondary}" />
      </linearGradient>
      <radialGradient id="lightA" cx="78%" cy="18%" r="40%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
        <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lightB" cx="18%" cy="82%" r="36%">
        <stop offset="0%" stop-color="${secondary}" stop-opacity="0.42" />
        <stop offset="100%" stop-color="${secondary}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#lightA)" />
    <rect width="${width}" height="${height}" fill="url(#lightB)" />
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getFallbackBackgroundOptions(
  orientation: "squarish" | "portrait",
): string[] {
  return FALLBACK_BACKGROUND_PALETTES.map((palette) =>
    buildFallbackBackgroundOption(palette, orientation),
  );
}

export function extractKeyword(prompt: string): string {
  const quoted = prompt.match(/"([^"]+)"/);
  if (quoted?.[1]) {
    const fromQuote = quoted[1]
      .toLowerCase()
      .replace(/[",.:;()]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 3)
      .join(" ");

    if (fromQuote.length > 3) return fromQuote;
  }

  const cleaned = prompt
    .toLowerCase()
    .replace(KEYWORD_NOISE, "")
    .replace(/[",.:;()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 3);

  return words.join(" ") || "professional business";
}

async function fetchUnsplashResults(
  keyword: string,
  page: number,
  orientation: "squarish" | "portrait" = "squarish",
) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&page=${page}&orientation=${orientation}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as {
    results?: Array<{ urls?: { regular?: string; small?: string } }>;
  };

  return uniqueUrls(
    (data.results || []).map((photo) => photo.urls?.regular || photo.urls?.small),
  );
}

async function fetchPexelsResults(keyword: string, page: number) {
  if (!process.env.PEXELS_API_KEY) return [];

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=10&page=${page}`,
    {
      cache: "no-store",
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as {
    photos?: Array<{ src?: { large2x?: string; large?: string; medium?: string } }>;
  };

  return uniqueUrls(
    (data.photos || []).map(
      (photo) => photo.src?.large2x || photo.src?.large || photo.src?.medium,
    ),
  );
}

async function fetchPixabayResults(keyword: string, page: number) {
  if (!process.env.PIXABAY_API_KEY) return [];

  const response = await fetch(
    `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=10&page=${page}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as {
    hits?: Array<{ largeImageURL?: string; webformatURL?: string }>;
  };

  return uniqueUrls(
    (data.hits || []).map((hit) => hit.largeImageURL || hit.webformatURL),
  );
}

export async function fetchBackgroundImage(
  prompt: string,
  attempt = 0,
  orientation: "squarish" | "portrait" = "squarish",
): Promise<string | null> {
  const keyword = extractKeyword(prompt);
  const page = (attempt % 3) + 1;

  try {
    const photos = await fetchUnsplashResults(keyword, page, orientation);
    if (photos.length > 0) {
      return photos[attempt % photos.length] ?? null;
    }
  } catch {}

  try {
    const photos = await fetchPexelsResults(keyword, page);
    if (photos.length > 0) {
      return photos[attempt % photos.length] ?? null;
    }
  } catch {}

  try {
    const photos = await fetchPixabayResults(keyword, page);
    if (photos.length > 0) {
      return photos[attempt % photos.length] ?? null;
    }
  } catch {}

  return null;
}

export async function fetchBackgroundOptions(
  prompt: string,
  orientation: "squarish" | "portrait" = "squarish",
  withFallback = true,
): Promise<string[]> {
  const keyword = extractKeyword(prompt);
  const urls: string[] = [];

  try {
    urls.push(...(await fetchUnsplashResults(keyword, 1, orientation)));
  } catch {}

  if (urls.length < 5) {
    try {
      urls.push(...(await fetchPexelsResults(keyword, 1)));
    } catch {}
  }

  if (urls.length < 5) {
    try {
      urls.push(...(await fetchPixabayResults(keyword, 1)));
    } catch {}
  }

  const unique = uniqueUrls(urls);
  if (!withFallback) {
    return unique.slice(0, 6);
  }

  return uniqueUrls([...unique, ...getFallbackBackgroundOptions(orientation)]).slice(
    0,
    6,
  );
}
