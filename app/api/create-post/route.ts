import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/lgpd/audit";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Modelos em ordem de preferência. Llama 3.3 70B é o melhor; os outros são fallback.
const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

type PostFormat = "single" | "carousel" | "reel";
type PostObjective =
  | "engajamento"
  | "vendas"
  | "autoridade"
  | "alcance"
  | "comunidade"
  | "lancamento";

type RequestBody = {
  topic?: string;
  format?: PostFormat;
  objective?: PostObjective;
  tone?: string;
  extraNotes?: string;
};

// Guia de paleta por arquétipo de tema. NÃO determina, INSPIRA.
const PALETTE_PLAYBOOK = `
PLAYBOOK DE PALETA POR TIPO DE TEMA (use como inspiração, NUNCA como receita fixa):

- Fitness / treino / movimento: vermelhos saturados, laranja elétrico, preto profundo, off-white. Energia.
- Wellness / yoga / mindfulness: verde-sage, areia, terracota, bege quente, off-white. Calma.
- Tech / IA / SaaS: azul-elétrico, preto, ciano neon, branco gelo, ou grafite + lime. Futuro.
- Luxo / premium / consultoria high-ticket: preto, off-white, bordô profundo, ouro escuro fosco. Sofisticação.
- Moda / beleza: rosa millennial, magenta, cinza-rosado, off-white com toque de gloss. Atual.
- Educação / cursos: azul-marinho, mostarda, off-white, terracota. Confiança + criatividade.
- Food / gastronomia: terracota, mostarda, verde-oliva, marrom-quente, creme. Apetite + autenticidade.
- Imobiliário / arquitetura: cinza-cimento, azul-piscina, terracota, branco. Solidez.
- Streetwear / lifestyle jovem: preto, branco, neon (verde-lima OU magenta OU laranja, escolha UM). Atitude.
- Maternal / kids: pêssego, lavanda, sage, off-white. Suavidade sem ser meloso.
- Black friday / urgência / promo: preto + amarelo-elétrico OU vermelho-elétrico. Choque.
- Sustentabilidade / ecologia: verde-musgo, terracota, areia, kraft. Orgânico real (sem clichê verde-floresta brilhante).
- Finanças / investimentos: navy, off-white, dourado escuro fosco, ou cinza-grafite + lime. Sobriedade + crescimento.
- Auto / moto / racing: vermelho-corrida, preto, branco-pista, prata-cromado. Velocidade.
- Religioso / espiritual: bege quente, dourado fosco, terracota, off-white. Reverência atual.

REGRA: o tema solicitado pelo usuário + o nicho do negócio + o tom escolhido determinam de qual arquétipo a paleta vai puxar. CRUZE com as cores da marca quando informadas — ancore pelo menos 1 das 4 cores na identidade existente.
`.trim();

// Base de tendências de design 2026 (atualizar quando o gosto da web mudar)
const DESIGN_TRENDS_2026 = `
TENDÊNCIAS DE DESIGN PARA INSTAGRAM/REDES SOCIAIS EM 2026:

1. TIPOGRAFIA MAXIMALISTA
   - Letras gigantes ocupando 60-80% do frame (Bebas Neue, Druk, Bricolage Grotesque, Reckless, PP Editorial New)
   - Palavras quebradas em múltiplas linhas para criar tensão visual
   - Mistura de serifa moderna + sans-serif condensada

2. BRUTALISMO SUÍÇO CONTROLADO
   - Grids visíveis, bordas pretas, espaço em branco generoso
   - Componentes parecendo "interface" (botões, badges, tags)
   - Inspiração em design suíço clássico, mas exagerado

3. CORES NEON SOBRE BASE NEUTRA
   - Fundos off-white, bege quente, cinza-papel ou preto profundo
   - Um (e SÓ um) ponto neon: lima elétrico (#C8F135), magenta (#FF006E), tangerina (#FF6700), azul iridescente
   - O neon define hierarquia, nunca polui

4. Y2K REVIVAL + CYBER NOSTALGIA
   - Glow, motion blur, chrome, frutiger aero
   - Stickers, gifs, gradientes holográficos pontuais
   - Mas dosado: não todo o post

5. AUTENTICIDADE FOTOGRÁFICA
   - Fotos de celular com leve grão
   - Imperfeição deliberada (papel amassado, ruído)
   - Nunca stock photo limpo demais

6. CARROSSEL STORYTELLING
   - Slide 1: hook gigante (tipografia + 1 cor de destaque)
   - Slides 2-7: minimalista, foco em uma ideia por slide
   - Slide final: CTA forte com botão falso (parece interativo)
   - Setas/números sutis indicando "deslize"

7. ELEMENTOS ORGÂNICOS
   - Blobs 3D, formas líquidas, hand-drawn scribbles
   - Quebram a rigidez do grid

8. CONTRASTE EXTREMO TEXT/BG
   - Preto sobre lima, lima sobre preto
   - Sem cinza no meio: a leitura no feed exige decisão binária de cor

9. MOBILE-FIRST 4:5 (1080x1350)
   - Composição vertical sempre
   - Texto importante no terço superior

10. ANTI-DESIGN INTENCIONAL
    - Quebrar 1 regra de design (alinhamento off, fonte misturada) gera atenção
`.trim();

function describeBusiness(business: Record<string, unknown> | null) {
  if (!business) return "Perfil de negócio não informado.";
  return `
- Negócio: ${business.business_name || "não informado"}
- Nicho: ${business.niche || "não informado"}
- Público-alvo: ${business.target_audience || "não informado"}
- Estilo de comunicação: ${business.communication_style || "não informado"}
- Objetivo principal: ${business.main_goal || "não informado"}
- Descrição da marca: ${business.brand_description || "não informado"}
- Instagram: @${business.instagram_handle || "não informado"}
- Cores da marca: ${(business.brand_colors as string[] | undefined)?.join(", ") || "não definidas"}
`.trim();
}

function buildPrompt(args: {
  business: Record<string, unknown> | null;
  topic: string;
  format: PostFormat;
  objective: PostObjective;
  tone?: string;
  extraNotes?: string;
}) {
  const { business, topic, format, objective, tone, extraNotes } = args;

  return `
Você é um diretor de arte + copywriter especialista em Instagram que cria posts
extremamente personalizados para cada negócio. Você conhece o estado da arte do
design para redes em 2026.

PERFIL DO NEGÓCIO:
${describeBusiness(business)}

BRIEFING DO POST:
- Tema/tópico solicitado pelo usuário: ${topic}
- Formato desejado: ${format}
- Objetivo do post: ${objective}
- Tom adicional (se informado): ${tone || "respeitar o estilo do negócio acima"}
- Observações extras: ${extraNotes || "nenhuma"}

${PALETTE_PLAYBOOK}

${DESIGN_TRENDS_2026}

ANÁLISE DE PALETA — OBRIGATÓRIO ANTES DE ESCOLHER CORES:
Pense passo a passo (mas NÃO escreva o raciocínio no JSON, só use):
1. Qual EMOÇÃO e ARQUÉTIPO o tema acima evoca? (energia, calma, sofisticação, urgência, nostalgia, autoridade, ternura...)
2. Qual o público-alvo do negócio? Que faixa etária e gosto visual?
3. O negócio tem cores de marca? Se sim, uma das 4 cores PRECISA ancorar nelas.
4. Qual arquétipo do PLAYBOOK acima melhor representa esse tema + esse negócio?
5. Como o objetivo "${objective}" influencia a saturação? (vendas/urgência = mais saturado; autoridade = mais sóbrio).

Só então escolha as 4 cores. NUNCA repita a paleta default preto/lima — cada tema gera paleta própria. Diferentes temas pro MESMO negócio devem gerar paletas DIFERENTES.

REGRAS DE GERAÇÃO:
1. NUNCA gere conteúdo genérico — TUDO deve refletir o nicho e a marca acima.
2. O hook precisa parar o scroll em 1 segundo.
3. A legenda deve ter quebras de linha estratégicas para legibilidade no Instagram.
4. As hashtags: 8 a 15 itens, mistura de hashtags amplas (#marketing) + nicho (#${(business?.niche as string) || "nicho"}) + comunidade local quando fizer sentido.
5. Para carrossel: 4 a 7 slides, cada slide tem 1 ideia clara.
6. O briefing visual deve ser EXECUTÁVEL: alguém com Canva consegue produzir.
7. As tendências 2026 devem estar PRESENTES no briefing visual mas adaptadas ao tom do negócio.
8. Use linguagem direta, sem jargão publicitário.
9. A paleta DEVE ter exatamente 4 cores: uma "fundo", uma "destaque", uma "texto", uma "secundaria". Cada role aparece UMA ÚNICA VEZ. Contraste fundo x texto >= 4.5:1 (legibilidade).
10. Escolha UM layout_template do enum abaixo que case com o tom do tema.

FORMATO DE RESPOSTA OBRIGATÓRIO:
Responda APENAS com um JSON válido, sem markdown, sem comentários, sem texto antes ou depois. O JSON DEVE seguir exatamente este shape:

{
  "format": "single" | "carousel" | "reel",
  "caption": {
    "hook": "string (a primeira linha que para o scroll, máx 120 caracteres)",
    "body": "string (corpo da legenda com quebras de linha \\n)",
    "cta": "string (chamada para ação final)"
  },
  "hashtags": ["#exemplo1", "#exemplo2"],
  "carousel_slides": [
    {
      "number": 1,
      "title": "string curta",
      "body": "string explicando o que vai no slide",
      "visual_direction": "string descrevendo o visual deste slide"
    }
  ],
  "visual_brief": {
    "concept": "frase de uma linha resumindo a peça",
    "style_keywords": ["palavra1", "palavra2"],
    "palette": [
      { "name": "Nome da cor", "hex": "#000000", "role": "fundo" },
      { "name": "Nome da cor", "hex": "#FFFFFF", "role": "texto" },
      { "name": "Nome da cor", "hex": "#FF6700", "role": "destaque" },
      { "name": "Nome da cor", "hex": "#666666", "role": "secundaria" }
    ],
    "palette_rationale": "1 frase explicando por que essa paleta combina com este tema específico",
    "typography": {
      "display": "Nome da fonte display (use as do briefing 2026 quando combinar)",
      "body": "Nome da fonte body",
      "treatment": "como tratar a tipografia"
    },
    "layout": "descrição da composição",
    "layout_template": "typography_oversized" | "side_block" | "asymmetric_brutal" | "frame_card" | "swiss_grid",
    "elements": ["elemento1", "elemento2"]
  },
  "trend_tips": ["dica 1", "dica 2", "dica 3"],
  "post_time_suggestion": "horário sugerido para postar e por quê",
  "vibe_summary": "uma frase resumindo a vibe do post"
}

REGRAS DO JSON:
- "carousel_slides" só deve estar populado se "format" == "carousel". Em outros formatos, devolver array vazio [].
- Paleta: SEMPRE incluir EXATAMENTE 4 cores, uma para cada role (fundo, texto, destaque, secundaria). Cada role aparece UMA ÚNICA VEZ.
- Trend tips: entre 3 e 5 dicas, cada uma referenciando uma das 10 tendências do briefing 2026.
- Hex sempre em formato #RRGGBB (6 dígitos).
- "layout_template" deve ser exatamente UM dos 5 valores do enum.
- "palette_rationale" deve mencionar explicitamente o tema solicitado.
`.trim();
}

// Limpa o JSON quando o modelo envolve em fences ou texto extra
function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }
  return raw;
}

const HISTORY_LIMIT = 6;

// Guarda o post gerado na conta do usuário e mantém só os 6 mais recentes.
async function persistGeneratedPost(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  topic: string;
  format: PostFormat;
  objective: PostObjective;
  post: unknown;
}) {
  const { supabase, userId, topic, format, objective, post } = args;
  try {
    const { error: insertError } = await supabase
      .from("generated_posts")
      .insert({ user_id: userId, topic, format, objective, post });
    if (insertError) {
      console.warn("[create-post] falha ao salvar histórico:", insertError.message);
      return;
    }

    const { data: extras } = await supabase
      .from("generated_posts")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(HISTORY_LIMIT, HISTORY_LIMIT + 24);
    if (extras && extras.length > 0) {
      await supabase
        .from("generated_posts")
        .delete()
        .in(
          "id",
          extras.map((row) => row.id),
        );
    }
  } catch (err) {
    console.warn("[create-post] erro inesperado ao salvar histórico:", err);
  }
}

// Lista os últimos feeds gerados pelo usuário (máximo 6).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("generated_posts")
    .select("id, topic, format, objective, post, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) {
    // Tabela pode ainda não existir — devolve lista vazia sem quebrar a tela.
    console.warn("[create-post] falha ao listar histórico:", error.message);
    return NextResponse.json({ ok: true, posts: [] });
  }

  return NextResponse.json({ ok: true, posts: data ?? [] });
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY não configurada. Adicione a chave em .env.local e reinicie o servidor.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const topic = (body.topic || "").trim();
  if (!topic) {
    return NextResponse.json(
      { error: "Informe um tópico ou tema para o post." },
      { status: 400 },
    );
  }
  if (topic.length > 600) {
    return NextResponse.json(
      { error: "Tópico muito longo (limite 600 caracteres)." },
      { status: 400 },
    );
  }

  const format: PostFormat =
    body.format === "carousel" || body.format === "reel" ? body.format : "single";
  const objective: PostObjective =
    body.objective &&
    ["engajamento", "vendas", "autoridade", "alcance", "comunidade", "lancamento"].includes(
      body.objective,
    )
      ? body.objective
      : "engajamento";

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const prompt = buildPrompt({
    business,
    topic,
    format,
    objective,
    tone: body.tone,
    extraNotes: body.extraNotes,
  });

  let lastError: unknown = null;

  for (const modelId of MODELS) {
    try {
      const result = await generateText({
        model: groq(modelId),
        prompt,
        temperature: 0.85,
        maxOutputTokens: 2200,
      });

      const cleaned = extractJson(result.text);
      try {
        const parsed = JSON.parse(cleaned);

        await logAudit({
          supabase,
          userId: user.id,
          action: "profile.update",
          entityType: "post_generation",
          metadata: { model: modelId, format, objective, topicChars: topic.length },
          request,
        });

        await persistGeneratedPost({
          supabase,
          userId: user.id,
          topic,
          format,
          objective,
          post: parsed,
        });

        return NextResponse.json({ ok: true, post: parsed, model: modelId });
      } catch (parseErr) {
        lastError = parseErr;
        console.warn(
          `[create-post] modelo ${modelId} respondeu mas JSON não parseou. Tentando próximo modelo.`,
          parseErr,
        );
        continue;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[create-post] modelo ${modelId} falhou:`, err);
      continue;
    }
  }

  return NextResponse.json(
    {
      error:
        "Não foi possível gerar o post agora. Tente novamente em alguns segundos.",
      detail: lastError instanceof Error ? lastError.message : String(lastError),
    },
    { status: 502 },
  );
}
