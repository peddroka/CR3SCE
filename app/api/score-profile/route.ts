import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 60;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "" });

interface ProblemItem {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface ImprovementItem {
  area: string;
  current: string;
  suggestion: string;
  example?: string;
}

interface CriterionDefinition {
  id: string;
  nome: string;
  peso: number;
  keywords: string[];
}

interface CriterionItem {
  id: string;
  nome: string;
  nota: number;
  peso: number;
  status: "otimo" | "bom" | "regular" | "ruim";
  feedback: string;
  acoes: string[];
}

interface PriorityImprovementItem {
  prioridade: number;
  criterio: string;
  impacto: "alto" | "medio" | "baixo";
  descricao: string;
  sugestao_concreta: string;
}

interface StructuredProfileInput {
  username?: string;
  foto_perfil_url?: string;
  bio?: string;
  nome_exibido?: string;
  num_posts?: number;
  num_seguidores?: number;
  num_seguindo?: number;
  ultimos_posts?: string[];
  nicho?: string;
  objetivo?: string;
}

const CRITERION_DEFINITIONS: CriterionDefinition[] = [
  {
    id: "foto_perfil",
    nome: "Foto de perfil",
    peso: 15,
    keywords: ["foto", "perfil", "logo", "logomarca", "avatar"],
  },
  {
    id: "nome_username",
    nome: "Nome e username",
    peso: 10,
    keywords: ["nome", "username", "usuario", "user", "arroba", "handle"],
  },
  {
    id: "bio",
    nome: "Bio",
    peso: 25,
    keywords: ["bio", "descricao", "descrição", "cta", "link"],
  },
  {
    id: "consistencia_conteudo",
    nome: "Consistência de conteúdo",
    peso: 20,
    keywords: ["conteudo", "conteúdo", "posts", "feed", "reels", "carrossel", "visual"],
  },
  {
    id: "engajamento_presenca",
    nome: "Engajamento e presença",
    peso: 15,
    keywords: ["engajamento", "seguidores", "seguindo", "posts", "presenca", "presença", "metricas", "métricas"],
  },
  {
    id: "alinhamento_objetivo",
    nome: "Alinhamento com objetivo",
    peso: 15,
    keywords: ["objetivo", "alinhamento", "clareza", "oferta", "resultado", "proposta"],
  },
];

const PROFILE_AREA_KEYWORDS: Array<{ key: string; keywords: string[] }> = [
  {
    key: "nome",
    keywords: ["nome de exibicao", "nome de pesquisa", "nome", "usuario", "handle"],
  },
  {
    key: "bio",
    keywords: ["bio", "descricao", "descrição"],
  },
  {
    key: "foto",
    keywords: ["foto de perfil", "foto", "logo", "logomarca", "perfil"],
  },
  {
    key: "link",
    keywords: ["link", "cta", "contato", "whatsapp", "direct"],
  },
  {
    key: "posts",
    keywords: ["post", "posts", "grade", "feed", "conteudo", "conteúdo"],
  },
  {
    key: "metricas",
    keywords: ["metrica", "métrica", "metricas", "métricas", "alcance", "visualiz", "engaj", "painel"],
  },
  {
    key: "categoria",
    keywords: ["categoria"],
  },
];

function normalizeText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeOutputText(value: string) {
  return (value || "")
    .replace(/\*/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeSingleLine(value: string) {
  return sanitizeOutputText(value).replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

function clampNote(value: unknown) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(10, Number(numeric.toFixed(1))));
}

function inferCriterionStatusFromNote(
  note: number,
): "otimo" | "bom" | "regular" | "ruim" {
  if (note >= 9) return "otimo";
  if (note >= 7) return "bom";
  if (note >= 5) return "regular";
  return "ruim";
}

function normalizeImpact(value: string): "alto" | "medio" | "baixo" {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized === "alto" || normalized === "medio" || normalized === "baixo") {
    return normalized as "alto" | "medio" | "baixo";
  }

  if (normalized === "médio") return "medio";
  return "medio";
}

function inferCriterionDefinition(value: string) {
  const normalized = normalizeText(value).toLowerCase();

  return (
    CRITERION_DEFINITIONS.find((criterion) =>
      criterion.keywords.some((keyword) =>
        normalized.includes(normalizeText(keyword).toLowerCase()),
      ),
    ) || null
  );
}

function normalizeActions(actions: unknown) {
  if (!Array.isArray(actions)) return [] as string[];

  return actions
    .map((action) => sanitizeSingleLine(String(action || "")))
    .filter(Boolean)
    .slice(0, 4);
}

function inferSeverity(value: string): "high" | "medium" | "low" {
  const severity = normalizeText(value).toLowerCase();

  if (severity === "high" || severity === "medium" || severity === "low") {
    return severity;
  }

  return "medium";
}

function inferAreaKeys(text: string) {
  const normalized = normalizeText(text).toLowerCase();
  const matches = new Set<string>();

  PROFILE_AREA_KEYWORDS.forEach((area) => {
    if (area.keywords.some((keyword) => normalized.includes(normalizeText(keyword).toLowerCase()))) {
      matches.add(area.key);
    }
  });

  return matches;
}

function _normalizeProblems(problems: unknown): ProblemItem[] {
  if (!Array.isArray(problems)) return [];

  return problems
    .map((problem) => {
      const item = problem as Partial<ProblemItem>;

      return {
        title: sanitizeOutputText(String(item?.title || "")),
        description: sanitizeOutputText(String(item?.description || "")),
        severity: inferSeverity(String(item?.severity || "")),
      };
    })
    .filter((item) => item.title && item.description);
}

function _normalizeImprovements(improvements: unknown): ImprovementItem[] {
  if (!Array.isArray(improvements)) return [];

  return improvements
    .map((improvement) => {
      const item = improvement as Partial<ImprovementItem>;

      return {
        area: sanitizeOutputText(String(item?.area || "")),
        current: sanitizeOutputText(String(item?.current || "")),
        suggestion: sanitizeOutputText(String(item?.suggestion || "")),
        example: sanitizeOutputText(String(item?.example || "")),
      };
    })
    .filter((item) => item.area && item.suggestion);
}

function filterCoherentImprovements(
  problems: ProblemItem[],
  improvements: ImprovementItem[],
) {
  const negativeAreas = new Set<string>();

  problems.forEach((problem) => {
    inferAreaKeys(`${problem.title} ${problem.description}`).forEach((key) =>
      negativeAreas.add(key),
    );
  });

  const seenAreas = new Set<string>();

  return improvements.filter((improvement) => {
    const inferredAreas = inferAreaKeys(
      `${improvement.area} ${improvement.current} ${improvement.suggestion} ${improvement.example || ""}`,
    );
    const areaKey =
      Array.from(inferredAreas)[0] || normalizeText(improvement.area).toLowerCase();

    if (seenAreas.has(areaKey)) {
      return false;
    }

    if (negativeAreas.size > 0) {
      const matchesNegativeArea = Array.from(inferredAreas).some((key) =>
        negativeAreas.has(key),
      );

      if (!matchesNegativeArea) {
        return false;
      }
    }

    seenAreas.add(areaKey);
    return true;
  });
}

function normalizeCriteria(criteria: unknown): CriterionItem[] {
  if (!Array.isArray(criteria)) return [];

  const normalized = criteria
    .map((criterion) => {
      const item = criterion as Partial<CriterionItem>;
      const definition =
        inferCriterionDefinition(String(item?.id || "")) ||
        inferCriterionDefinition(String(item?.nome || "")) ||
        inferCriterionDefinition(String(item?.feedback || ""));

      if (!definition) {
        return null;
      }

      const note = clampNote(item?.nota);

      return {
        id: definition.id,
        nome: definition.nome,
        nota: note,
        peso: definition.peso,
        status:
          typeof item?.status === "string" &&
          ["otimo", "bom", "regular", "ruim"].includes(
            normalizeText(item.status).toLowerCase(),
          )
            ? (normalizeText(item.status).toLowerCase() as
                | "otimo"
                | "bom"
                | "regular"
                | "ruim")
            : inferCriterionStatusFromNote(note),
        feedback: sanitizeOutputText(String(item?.feedback || "")),
        acoes: normalizeActions(item?.acoes),
      } satisfies CriterionItem;
    })
    .filter(Boolean) as CriterionItem[];

  const byId = new Map(normalized.map((criterion) => [criterion.id, criterion]));

  return CRITERION_DEFINITIONS.map((definition) => {
    const existing = byId.get(definition.id);

    if (existing) {
      return {
        ...existing,
        nome: definition.nome,
        peso: definition.peso,
      };
    }

    return {
      id: definition.id,
      nome: definition.nome,
      nota: 0,
      peso: definition.peso,
      status: "regular",
      feedback: "Não houve evidência suficiente para analisar este critério com segurança.",
      acoes: ["Revisar esse ponto manualmente na próxima análise."],
    } satisfies CriterionItem;
  });
}

function normalizePriorityImprovements(
  improvements: unknown,
): PriorityImprovementItem[] {
  if (!Array.isArray(improvements)) return [];

  return improvements
    .map((improvement, index) => {
      const item = improvement as Partial<PriorityImprovementItem>;
      const definition =
        inferCriterionDefinition(String(item?.criterio || "")) ||
        inferCriterionDefinition(String(item?.descricao || "")) ||
        null;

      return {
        prioridade: Number(item?.prioridade) || index + 1,
        criterio: definition?.id || sanitizeSingleLine(String(item?.criterio || "")),
        impacto: normalizeImpact(String(item?.impacto || "")),
        descricao: sanitizeOutputText(String(item?.descricao || "")),
        sugestao_concreta: sanitizeOutputText(
          String(item?.sugestao_concreta || ""),
        ),
      } satisfies PriorityImprovementItem;
    })
    .filter((item) => item.criterio && item.descricao && item.sugestao_concreta)
    .sort((a, b) => a.prioridade - b.prioridade);
}

function trimToLength(value: string, maxLength: number) {
  const cleaned = sanitizeSingleLine(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.slice(0, maxLength).trim();
}

function buildBioSuggestionFallback(
  input: StructuredProfileInput,
  criterioDescricao: string,
) {
  const niche = sanitizeSingleLine(input.nicho || "seu nicho");
  const objective = sanitizeSingleLine(input.objetivo || "gerar resultado");
  const candidate = `✨ ${niche} para quem busca ${objective} | Chame no direct 👇`;

  if (candidate.length <= 150) {
    return candidate;
  }

  const fallback = `✨ ${niche} com foco em ${objective} | Chame no direct 👇`;
  return trimToLength(
    fallback.length <= 150 ? fallback : `${sanitizeSingleLine(criterioDescricao)} 👇`,
    150,
  );
}

function enforcePriorityImprovementFormat(
  improvement: PriorityImprovementItem,
  input: StructuredProfileInput,
) {
  if (improvement.criterio !== "bio") {
    return {
      ...improvement,
      descricao: sanitizeOutputText(improvement.descricao),
      sugestao_concreta: sanitizeOutputText(improvement.sugestao_concreta),
    };
  }

  const suggestion = trimToLength(
    improvement.sugestao_concreta || buildBioSuggestionFallback(input, improvement.descricao),
    150,
  );

  return {
    ...improvement,
    descricao: sanitizeOutputText(improvement.descricao),
    sugestao_concreta:
      suggestion || buildBioSuggestionFallback(input, improvement.descricao),
  };
}

function filterCoherentPriorityImprovements(
  criteria: CriterionItem[],
  improvements: PriorityImprovementItem[],
) {
  const criterionById = new Map(criteria.map((criterion) => [criterion.id, criterion]));
  const seen = new Set<string>();

  return improvements.filter((improvement) => {
    const criterion =
      criterionById.get(improvement.criterio) ||
      criteria.find((item) =>
        item.nome.toLowerCase() === improvement.criterio.toLowerCase(),
      );

    if (!criterion) return false;
    if (seen.has(criterion.id)) return false;
    if (criterion.status === "bom" || criterion.status === "otimo") {
      return false;
    }

    seen.add(criterion.id);
    improvement.criterio = criterion.id;
    return true;
  });
}

function enforceCriteriaContext(
  criteria: CriterionItem[],
  context: {
    hasPhotoEvidence: boolean;
    hasPostEvidence: boolean;
  },
) {
  return criteria.map((criterion) => {
    if (criterion.id === "foto_perfil" && !context.hasPhotoEvidence) {
      return {
        ...criterion,
        nota: Math.max(criterion.nota, 6),
        status: "regular",
        feedback:
          "Não houve foto de perfil suficiente para análise visual detalhada. Os outros critérios foram avaliados normalmente, mas aqui o ideal é enviar uma imagem nítida do avatar ou logo.",
        acoes: [
          "Envie uma foto de perfil nítida ou um print aproximado do avatar.",
          "Se for logo, garanta contraste forte e leitura clara em tamanho pequeno.",
        ],
      } satisfies CriterionItem;
    }

    if (criterion.id === "consistencia_conteudo" && !context.hasPostEvidence) {
      return {
        ...criterion,
        nota: Math.max(criterion.nota, 6),
        status: "regular",
        feedback:
          "Não houve informação suficiente sobre os últimos posts ou a frequência recente para validar consistência com segurança. A leitura aqui fica parcial até receber exemplos do feed.",
        acoes: [
          "Envie descrições dos últimos posts ou um print do grid recente.",
          "Mostre variedade entre foto, carrossel e reels para uma leitura mais precisa.",
        ],
      } satisfies CriterionItem;
    }

    return criterion;
  });
}

function extractJsonObject(text: string) {
  const cleaned = (text || "").replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Resposta da IA sem JSON válido.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function inferClassification(note: number) {
  if (note >= 8.5) return "Perfil forte e pronto para escalar";
  if (note >= 7) return "Perfil em desenvolvimento";
  if (note >= 5) return "Perfil com base boa, mas confuso";
  return "Perfil precisando de ajustes urgentes";
}

function calculateWeightedNote(criteria: CriterionItem[]) {
  const totalWeight = criteria.reduce((sum, item) => sum + item.peso, 0) || 100;
  const weighted =
    criteria.reduce((sum, item) => sum + item.nota * item.peso, 0) / totalWeight;
  return Number(weighted.toFixed(1));
}

function buildLegacyProblemsFromCriteria(criteria: CriterionItem[]): ProblemItem[] {
  return criteria
    .filter((criterion) => criterion.status === "regular" || criterion.status === "ruim")
    .map((criterion) => ({
      title: `${criterion.nome} precisa de ajuste`,
      description: criterion.feedback,
      severity: criterion.nota < 5 ? "high" : criterion.nota < 7 ? "medium" : "low",
    }));
}

function buildLegacyImprovementsFromPriorities(
  criteria: CriterionItem[],
  improvements: PriorityImprovementItem[],
): ImprovementItem[] {
  const criterionById = new Map(criteria.map((criterion) => [criterion.id, criterion]));

  return improvements.map((improvement) => {
    const criterion = criterionById.get(improvement.criterio);

    return {
      area: criterion?.nome || improvement.criterio,
      current: criterion?.feedback || improvement.descricao,
      suggestion: improvement.descricao,
      example: improvement.sugestao_concreta,
    };
  });
}

function buildLegacyBiosFromPriorities(improvements: PriorityImprovementItem[]) {
  const bioImprovement = improvements.find((item) => item.criterio === "bio");

  if (!bioImprovement) return [];

  return [
    {
      option: 1,
      text: sanitizeSingleLine(bioImprovement.sugestao_concreta).slice(0, 150),
      explanation: "Sugestão prioritária de bio baseada na análise do perfil.",
    },
  ];
}

function buildStrongPointsFromCriteria(criteria: CriterionItem[]) {
  return criteria
    .filter((criterion) => criterion.status === "bom" || criterion.status === "otimo")
    .slice(0, 3)
    .map((criterion) => sanitizeSingleLine(`${criterion.nome}: ${criterion.feedback}`));
}

function buildSummaryFallback(note: number, criteria: CriterionItem[]) {
  const best = [...criteria].sort((a, b) => b.nota - a.nota)[0];
  const weakest = [...criteria].sort((a, b) => a.nota - b.nota)[0];

  return sanitizeOutputText(
    `Seu perfil está em ${inferClassification(note).toLowerCase()}. O ponto mais forte hoje é ${best?.nome?.toLowerCase() || "a base do perfil"}, e o ajuste mais importante está em ${weakest?.nome?.toLowerCase() || "clareza da proposta"}.`,
  );
}

function buildNextStepsFallback(improvements: PriorityImprovementItem[]) {
  const first = improvements[0];

  if (!first) {
    return "Seu foco agora deve ser manter a consistência do perfil e revisar os pontos que já estão funcionando para não perder clareza ao crescer.";
  }

  return sanitizeOutputText(
    `Comece pelo critério ${first.criterio.replace(/_/g, " ")}. Esse ajuste tende a gerar o maior impacto agora. Depois, revise o restante com calma e mantenha consistência no perfil inteiro.`,
  );
}

async function imageUrlToModelContent(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType =
      response.headers.get("content-type")?.includes("png")
        ? "image/png"
        : "image/jpeg";

    return {
      type: "image" as const,
      image: Buffer.from(arrayBuffer).toString("base64"),
      mimeType,
    };
  } catch {
    return null;
  }
}

function buildStructuredProfileContext(input: StructuredProfileInput) {
  const posts = Array.isArray(input.ultimos_posts) ? input.ultimos_posts.slice(0, 9) : [];

  return [
    `username: ${sanitizeSingleLine(input.username || "não informado")}`,
    `nome_exibido: ${sanitizeSingleLine(input.nome_exibido || "não informado")}`,
    `bio: ${sanitizeOutputText(input.bio || "não informado")}`,
    `num_posts: ${Number(input.num_posts) || 0}`,
    `num_seguidores: ${Number(input.num_seguidores) || 0}`,
    `num_seguindo: ${Number(input.num_seguindo) || 0}`,
    `nicho: ${sanitizeSingleLine(input.nicho || "não informado")}`,
    `objetivo: ${sanitizeSingleLine(input.objetivo || "não informado")}`,
    `ultimos_posts: ${
      posts.length
        ? posts.map((post, index) => `${index + 1}. ${sanitizeSingleLine(post)}`).join(" | ")
        : "não informado"
    }`,
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      images?: string[] | string;
      niche?: string;
      business_name?: string;
      previous_problems?: ProblemItem[];
    } & StructuredProfileInput;

    const imageList = (Array.isArray(body.images) ? body.images : [body.images])
      .filter(Boolean)
      .map((item) => String(item));
    const profileInput: StructuredProfileInput = {
      username: body.username,
      foto_perfil_url: body.foto_perfil_url,
      bio: body.bio,
      nome_exibido: body.nome_exibido,
      num_posts: body.num_posts,
      num_seguidores: body.num_seguidores,
      num_seguindo: body.num_seguindo,
      ultimos_posts: body.ultimos_posts,
      nicho: body.nicho || body.niche,
      objetivo: body.objetivo,
    };
    const niche = sanitizeSingleLine(profileInput.nicho || body.niche || "negócio local");
    const businessName = sanitizeSingleLine(
      body.business_name ||
        profileInput.nome_exibido ||
        profileInput.username ||
        "Perfil analisado",
    );
    const previousProblems = Array.isArray(body.previous_problems)
      ? body.previous_problems
      : [];
    const hasPreviousAnalysis = previousProblems.length > 0;
    const hasProfessionalPanel = imageList.length > 1;
    const hasStructuredProfile = Boolean(
      profileInput.username ||
        profileInput.bio ||
        profileInput.nome_exibido ||
        profileInput.num_posts ||
        profileInput.num_seguidores ||
        profileInput.num_seguindo ||
        (profileInput.ultimos_posts && profileInput.ultimos_posts.length > 0),
    );

    if (!imageList.length && !hasStructuredProfile) {
      return new Response(
        JSON.stringify({ error: "Envie prints ou dados do perfil para análise." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const previousContext = hasPreviousAnalysis
      ? `ANÁLISE ANTERIOR - problemas identificados previamente:
${previousProblems.map((p) => `- ${p.title}: ${p.description}`).join("\n")}

INSTRUÇÃO CRÍTICA: Se o perfil ainda apresenta os mesmos problemas, mantenha a coerência. Só remova um problema se houver evidência real de que ele foi corrigido.`
      : "";

    const structuredContext = hasStructuredProfile
      ? `DADOS ESTRUTURADOS DO PERFIL:
${buildStructuredProfileContext(profileInput)}`
      : "DADOS ESTRUTURADOS DO PERFIL: não foram fornecidos.";

    const fetchedProfilePhoto =
      !imageList.length && profileInput.foto_perfil_url
        ? await imageUrlToModelContent(profileInput.foto_perfil_url)
        : null;
    const hasPhotoEvidence = imageList.length > 0 || Boolean(fetchedProfilePhoto);
    const hasPostEvidence =
      imageList.length > 0 ||
      (Array.isArray(profileInput.ultimos_posts) && profileInput.ultimos_posts.length > 0);

    const prompt = `Você é um especialista em crescimento orgânico no Instagram. Analise o perfil recebido e retorne uma nota detalhada com melhorias claras e acionáveis.

NEGÓCIO OU PERFIL ANALISADO: ${businessName}
NICHO: ${niche}
OBJETIVO: ${sanitizeSingleLine(profileInput.objetivo || "não informado")}

${previousContext}

CONTEXTO DISPONÍVEL:
- Prints recebidos: ${imageList.length}
- Painel profissional visível: ${hasProfessionalPanel ? "sim" : "não"}
- Foto de perfil enviada separadamente: ${fetchedProfilePhoto ? "sim" : profileInput.foto_perfil_url ? "url fornecida, mas sem análise visual garantida" : "não"}
- Há evidências visuais suficientes da foto de perfil: ${hasPhotoEvidence ? "sim" : "não"}
- Há evidências suficientes dos últimos posts: ${hasPostEvidence ? "sim" : "não"}

${structuredContext}

CRITÉRIOS DE AVALIAÇÃO:
1. FOTO DE PERFIL, peso 15
- Rosto visível, expressão confiante, fundo limpo e qualidade.
- Se for logo, avalie legibilidade em tamanho pequeno e contraste.
2. NOME E USERNAME, peso 10
- Verifique se o nome contém palavras-chave do nicho.
- Verifique se o username é fácil de lembrar e digitar.
3. BIO, peso 25
- Avalie se deixa claro o que faz, para quem e qual resultado entrega.
- Avalie CTA, link, WhatsApp ou convite para ação.
- Diga se está específica ou genérica.
4. CONSISTÊNCIA DE CONTEÚDO, peso 20
- Avalie identidade visual, variedade de formatos e frequência.
5. ENGAJAMENTO E PRESENÇA, peso 15
- Avalie a proporção seguidores/seguindo.
6. ALINHAMENTO COM OBJETIVO, peso 15
- Diga se um visitante novo entenderia em 3 segundos o que esse perfil oferece.

REGRAS OBRIGATÓRIAS:
1. Seja específico, honesto e encorajador. Nada de comentário genérico.
2. Só sugira melhoria para um critério se ele tiver sido avaliado como regular ou ruim.
3. Se um critério estiver bom ou ótimo, ele não pode aparecer nas melhorias prioritárias.
4. Nunca use a frase Veja como ficaria.
5. Sugestões devem dizer exatamente o que mudar e por que isso ajuda.
6. Se não houver foto de perfil suficiente para analisar, diga isso no feedback do critério e não invente detalhes.
7. A bio sugerida precisa ser personalizada para o nicho e objetivo. Use emojis estrategicamente. Máximo 150 caracteres.
8. Pontos fortes precisam ser reais e coerentes com as notas.
9. Se faltarem dados sobre últimos posts ou frequência, diga isso claramente no critério de consistência.
10. Responda apenas com JSON válido e sem markdown.
11. Nunca contradiga a própria análise. Se você elogiou um ponto, não o coloque nas melhorias.
12. Nunca use feedbacks vagos como melhore sua bio. Explique como e por quê.

STATUS PERMITIDOS POR CRITÉRIO:
- otimo
- bom
- regular
- ruim

Retorne exatamente esta estrutura:
{
  "nota_geral": 7.4,
  "classificacao": "Perfil em desenvolvimento",
  "resumo": "Frase de 1-2 linhas resumindo o estado atual do perfil de forma encorajadora e honesta.",
  "criterios": [
    {
      "id": "foto_perfil",
      "nome": "Foto de perfil",
      "nota": 8,
      "peso": 15,
      "status": "bom",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1", "Ação 2"]
    },
    {
      "id": "nome_username",
      "nome": "Nome e username",
      "nota": 0,
      "peso": 10,
      "status": "regular",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1"]
    },
    {
      "id": "bio",
      "nome": "Bio",
      "nota": 0,
      "peso": 25,
      "status": "regular",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1"]
    },
    {
      "id": "consistencia_conteudo",
      "nome": "Consistência de conteúdo",
      "nota": 0,
      "peso": 20,
      "status": "regular",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1"]
    },
    {
      "id": "engajamento_presenca",
      "nome": "Engajamento e presença",
      "nota": 0,
      "peso": 15,
      "status": "regular",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1"]
    },
    {
      "id": "alinhamento_objetivo",
      "nome": "Alinhamento com objetivo",
      "nota": 0,
      "peso": 15,
      "status": "regular",
      "feedback": "Feedback específico",
      "acoes": ["Ação 1"]
    }
  ],
  "melhorias_prioritarias": [
    {
      "prioridade": 1,
      "criterio": "bio",
      "impacto": "alto",
      "descricao": "Explique o que está fraco nesse critério e por que isso importa.",
      "sugestao_concreta": "Sugestão concreta pronta para aplicar. Se for bio, entregue o texto final da bio com emojis. Máximo 150 caracteres."
    }
  ],
  "pontos_fortes": [
    "Ponto positivo específico e real"
  ],
  "proximos_passos": "Parágrafo curto, motivador e prático."
}`;

    const imageContents = imageList.map((img) => {
      const base64Data = img.includes(",") ? img.split(",")[1] : img;
      const mediaType = img.includes("image/png") ? "image/png" : "image/jpeg";
      return {
        type: "image" as const,
        image: base64Data,
        mimeType: mediaType,
      };
    });

    if (fetchedProfilePhoto) {
      imageContents.push(fetchedProfilePhoto);
    }

    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: [
        {
          role: "user",
          content: [...imageContents, { type: "text", text: prompt }],
        },
      ],
      temperature: 0.2,
    });

    const parsed = extractJsonObject(text);

    const criteria = enforceCriteriaContext(normalizeCriteria(parsed?.criterios), {
      hasPhotoEvidence,
      hasPostEvidence,
    });
    const note =
      typeof parsed?.nota_geral === "number"
        ? clampNote(parsed.nota_geral)
        : calculateWeightedNote(criteria);
    const classificacao = sanitizeOutputText(
      String(parsed?.classificacao || inferClassification(note)),
    );
    const resumo = sanitizeOutputText(
      String(parsed?.resumo || buildSummaryFallback(note, criteria)),
    );
    const melhoriasPrioritarias = filterCoherentPriorityImprovements(
      criteria,
      normalizePriorityImprovements(parsed?.melhorias_prioritarias)
        .filter((item) => hasPhotoEvidence || item.criterio !== "foto_perfil")
        .map((item) => enforcePriorityImprovementFormat(item, profileInput)),
    );
    const pontosFortes = buildStrongPointsFromCriteria(criteria);
    const proximosPassos = sanitizeOutputText(
      String(parsed?.proximos_passos || buildNextStepsFallback(melhoriasPrioritarias)),
    );

    const problems = buildLegacyProblemsFromCriteria(criteria);
    const improvements = filterCoherentImprovements(
      problems,
      buildLegacyImprovementsFromPriorities(criteria, melhoriasPrioritarias),
    );
    const bios = buildLegacyBiosFromPriorities(melhoriasPrioritarias);
    const tips = [proximosPassos].filter(Boolean);

    const normalizedPayload = {
      nota_geral: note,
      classificacao,
      resumo,
      criterios: criteria,
      melhorias_prioritarias: melhoriasPrioritarias,
      pontos_fortes: pontosFortes,
      proximos_passos: proximosPassos,
      score: Math.round(note * 10),
      grade: classificacao,
      summary: resumo,
      problems,
      improvements,
      bios,
      tips,
    };

    return new Response(JSON.stringify(normalizedPayload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao analisar perfil:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao analisar perfil" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
