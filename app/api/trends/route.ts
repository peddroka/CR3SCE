import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 60;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "" });

interface SearchResult {
  query: string;
  source: string;
  title: string;
  snippet: string;
  url: string;
}

interface SourcePage {
  url: string;
  title: string;
  text: string;
}

interface TrendIdea {
  content_type: string;
  trend_name: string;
  audio_used: string;
  on_screen_text: string;
  creator_action: string;
  how_it_works: string;
  adapted_script: string;
  recording_instructions: string;
}

const SEARCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MONTHS_EN = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const TREND_SOURCE_ALLOWLIST = [
  "later.com",
  "buffer.com",
  "kapwing.com",
  "newengen.com",
  "indiatimes.com",
  "vogue.com",
];

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value: string) {
  return decodeHtml(value || "")
    .replace(/\*/g, "")
    .replace(/[\u201C\u201D"]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string) {
  return cleanText(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Resposta da IA sem JSON valido");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();

  if (!trimmed) return "";

  try {
    if (trimmed.startsWith("//")) {
      return new URL(`https:${trimmed}`).toString();
    }

    if (trimmed.startsWith("/l/?")) {
      const url = new URL(`https://duckduckgo.com${trimmed}`);
      return decodeURIComponent(url.searchParams.get("uddg") || "");
    }

    if (trimmed.includes("duckduckgo.com/l/?")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https:${trimmed}`);
      return decodeURIComponent(url.searchParams.get("uddg") || "");
    }

    return new URL(trimmed).toString();
  } catch {
    return "";
  }
}

function getMonthContext(date = new Date()) {
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return {
    monthPt: MONTHS_PT[monthIndex],
    monthEn: MONTHS_EN[monthIndex],
    year,
  };
}

function buildTrendQueries(date = new Date()) {
  const { monthPt, monthEn, year } = getMonthContext(date);

  return [
    `trending reels Instagram ${monthEn} ${year}`,
    `trend TikTok viral agora ${monthPt} ${year}`,
    `audio viral Instagram hoje ${monthPt} ${year}`,
    `viral TikTok trend ${monthEn} ${year}`,
  ];
}

function dedupeResults(results: SearchResult[]) {
  const seen = new Set<string>();

  return results.filter((item) => {
    const key = item.url || `${item.source}-${item.title}`;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function sanitizeIdea(rawIdea: Partial<TrendIdea>): TrendIdea {
  return {
    content_type: cleanText(rawIdea.content_type || "Reels") || "Reels",
    trend_name: cleanText(rawIdea.trend_name || "Trend atual adaptada"),
    audio_used: cleanText(rawIdea.audio_used || "Use o audio em alta mais proximo do padrao descrito"),
    on_screen_text: cleanText(rawIdea.on_screen_text || "Use uma frase curta e direta na tela"),
    creator_action: cleanText(rawIdea.creator_action || "Grave em primeira pessoa, com gestos naturais e cortes simples"),
    how_it_works: cleanText(rawIdea.how_it_works || "Adapte a estrutura da trend ao seu nicho, mantendo o ritmo e a ideia central"),
    adapted_script: cleanText(rawIdea.adapted_script || "Mostre o seu contexto real e fale de forma natural, como se estivesse conversando com um cliente"),
    recording_instructions: cleanText(rawIdea.recording_instructions || "Grave na vertical, com boa luz, texto curto na tela e cortes rapidos"),
  };
}

function extractHostname(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isPriorityTrendSource(url: string) {
  const hostname = extractHostname(url);
  return TREND_SOURCE_ALLOWLIST.some((domain) => hostname.includes(domain));
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: SEARCH_HEADERS,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const links = Array.from(
    html.matchAll(
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    ),
  );
  const snippets = Array.from(
    html.matchAll(
      /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi,
    ),
  );

  return links
    .map((match, index) => {
      const url = normalizeUrl(match[1] || "");
      const title = stripHtml(match[2] || "");
      const snippet = stripHtml(snippets[index]?.[1] || snippets[index]?.[2] || "");

      return {
        query,
        source: "duckduckgo",
        title,
        snippet,
        url,
      };
    })
    .filter((item) => item.url && item.title)
    .slice(0, 6);
}

async function searchGoogleNews(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
    {
      headers: SEARCH_HEADERS,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi));

  return items
    .map((match) => {
      const itemXml = match[1] || "";
      const title = cleanText(itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] || itemXml.match(/<title>(.*?)<\/title>/i)?.[1] || "");
      const link = cleanText(itemXml.match(/<link>(.*?)<\/link>/i)?.[1] || "");
      const description = stripHtml(
        itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i)?.[1] ||
          itemXml.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ||
          "",
      );

      return {
        query,
        source: "google-news",
        title,
        snippet: description,
        url: link,
      };
    })
    .filter((item) => item.url && item.title)
    .slice(0, 6);
}

function buildKnownSourceUrls(date = new Date()) {
  const { monthEn, year } = getMonthContext(date);

  return [
    "https://later.com/blog/instagram-reels-trends/",
    "https://buffer.com/resources/trending-audio-instagram/",
    `https://www.kapwing.com/resources/${monthEn}-${year}-tiktok-trends-for-creators-brands/`,
    `https://newengen.com/insights/${monthEn}-${year}-tiktok-trends/`,
  ];
}

async function fetchSourcePage(url: string, title: string): Promise<SourcePage | null> {
  try {
    const response = await fetch(url, {
      headers: SEARCH_HEADERS,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const text = stripHtml(html).slice(0, 4500);

    if (!text) {
      return null;
    }

    return {
      url,
      title: cleanText(title) || url,
      text,
    };
  } catch {
    return null;
  }
}

async function buildTrendResearch() {
  const queries = buildTrendQueries();
  const searchTasks = queries.flatMap((query) => [
    searchDuckDuckGo(query),
    searchGoogleNews(query),
  ]);
  const settledResults = await Promise.allSettled(searchTasks);

  const searchResults = dedupeResults(
    settledResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    ),
  );

  const prioritizedResults = [
    ...searchResults.filter((item) => isPriorityTrendSource(item.url)),
    ...searchResults.filter((item) => !isPriorityTrendSource(item.url)),
  ];

  const knownSources = buildKnownSourceUrls().map((url) => ({
    query: "known-source",
    source: "known-source",
    title: extractHostname(url),
    snippet: "Fonte recorrente sobre trends de video curto",
    url,
  }));

  const pageCandidates = dedupeResults([
    ...prioritizedResults,
    ...knownSources,
  ]).slice(0, 8);

  const openedPages = (
    await Promise.allSettled(
      pageCandidates.map((candidate) =>
        fetchSourcePage(candidate.url, candidate.title),
      ),
    )
  )
    .flatMap((result) => (result.status === "fulfilled" && result.value ? [result.value] : []))
    .slice(0, 4);

  return {
    queries,
    searchResults: prioritizedResults.slice(0, 12),
    openedPages,
  };
}

function buildResearchPrompt(
  niche: string,
  businessName: string,
  searchResults: SearchResult[],
  openedPages: SourcePage[],
) {
  const searchDigest = searchResults
    .map(
      (result, index) =>
        `${index + 1}. consulta: ${result.query}\nfonte: ${result.source}\ntitulo: ${result.title}\nresumo: ${result.snippet}\nlink: ${result.url}`,
    )
    .join("\n\n");

  const pageDigest = openedPages
    .map(
      (page, index) =>
        `FONTE ${index + 1}\nurl: ${page.url}\ntitulo: ${page.title}\nconteudo: ${page.text}`,
    )
    .join("\n\n");

  return `
Você é um estrategista de conteúdo que transforma trends atuais em ideias prontas para negócios.

Negócio: ${businessName}
Nicho: ${niche}

Use apenas os sinais reais das buscas e das fontes abaixo para identificar 3 trends atuais de vídeos curtos.

RESULTADOS DAS BUSCAS:
${searchDigest}

FONTES ABERTAS:
${pageDigest}

Tarefa:
1. Identifique 3 trends diferentes e atuais.
2. Para cada trend, descubra o padrão principal:
   - áudio usado
   - estrutura do vídeo
   - texto que aparece na tela
   - ação que o criador faz
3. Adapte a trend para o nicho "${niche}" e para o negócio "${businessName}".
4. Nunca diga que você buscou ou encontrou isso em TikTok, Instagram, pesquisa, busca, web ou internet.
5. Apresente as sugestões como estratégias prontas do próprio sistema.

Regras:
- Retorne exatamente 3 trends
- Todas devem ser diferentes entre si
- Use português do Brasil com acentuação correta
- Nunca use asteriscos
- Nunca use emojis
- Nunca use aspas para destacar palavras
- Use frases naturais e diretas
- O campo adapted_script deve ser pronto para gravar
- O campo recording_instructions deve explicar enquadramento, cortes, texto na tela e ação da pessoa
- O content_type deve ser sempre Reels

Responda APENAS com JSON válido neste formato:
{
  "ideas": [
    {
      "content_type": "Reels",
      "trend_name": "nome da trend",
      "audio_used": "audio ou tipo de audio usado",
      "on_screen_text": "texto principal na tela",
      "creator_action": "acao que o criador executa",
      "how_it_works": "explicacao clara de como a trend funciona",
      "adapted_script": "roteiro adaptado para o cliente",
      "recording_instructions": "instrucao pratica de gravacao"
    }
  ]
}
`.trim();
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY nao configurada" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { niche, business_name } = await req.json();
    const safeNiche = cleanText(niche || "negocio local");
    const safeBusinessName = cleanText(business_name || "seu negocio");
    const research = await buildTrendResearch();

    if (research.searchResults.length === 0 || research.openedPages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Nao foi possivel carregar trends atuais agora. Tente novamente em instantes.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const prompt = buildResearchPrompt(
      safeNiche,
      safeBusinessName,
      research.searchResults,
      research.openedPages,
    );

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.6,
      maxOutputTokens: 2600,
    });

    const parsed = extractJson(text) as { ideas?: TrendIdea[] };
    const ideas = Array.isArray(parsed.ideas)
      ? parsed.ideas.slice(0, 3).map(sanitizeIdea)
      : [];

    if (ideas.length !== 3) {
      return new Response(
        JSON.stringify({
          error: "Nao foi possivel montar 3 trends validas agora. Tente novamente.",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ideas,
        updated_at: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Erro ao carregar tendencias",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
