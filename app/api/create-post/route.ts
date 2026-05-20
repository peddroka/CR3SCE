import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/lgpd/audit";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Modelos em ordem de preferencia. Llama 3.3 70B e o melhor; os outros sao fallback.
const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
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

// Guia de paleta por arquetipo de tema. NAO determina, INSPIRA.
const PALETTE_PLAYBOOK = `
PLAYBOOK DE PALETA POR TIPO DE TEMA (use como inspiracao, NUNCA como receita fixa):

- Fitness / treino / movimento: vermelhos saturados, laranja eletric, preto profundo, off-white. Energia.
- Wellness / yoga / mindfulness: verde-sage, areia, terracota, bege quente, off-white. Calma.
- Tech / IA / SaaS: azul-eletric, preto, ciano neon, branco gelo, ou grafite + lime. Futuro.
- Luxo / premium / consultoria high-ticket: preto, off-white, bordo profundo, ouro escuro fosco. Sofisticacao.
- Moda / beleza: rosa millennial, magenta, cinza-rosado, off-white com toque de gloss. Atual.
- Educacao / cursos: azul-marinho, mostarda, off-white, terracota. Confianca + criatividade.
- Food / gastronomia: terracota, mostarda, verde-oliva, marrom-quente, creme. Apetite + autenticidade.
- Imobiliario / arquitetura: cinza-cimento, azul-piscina, terracota, branco. Solidez.
- Streetwear / lifestyle jovem: preto, branco, neon (verde-lima OU magenta OU laranja, escolha UM). Atitude.
- Maternal / kids: pessego, lavanda, sage, off-white. Suavidade sem ser meloso.
- Black friday / urgencia / promo: preto + amarelo-eletrico OU vermelho-eletrico. Choque.
- Sustentabilidade / ecologia: verde-musgo, terracota, areia, kraft. Organico real (sem clichê verde-floresta brilhante).
- Financas / investimentos: navy, off-white, dourado escuro fosco, ou cinza-grafite + lime. Sobriedade + crescimento.
- Auto / moto / racing: vermelho-corrida, preto, branco-pista, prata-cromado. Velocidade.
- Religioso / espiritual: bege quente, dourado fosco, terracota, off-white. Reverencia atual.

REGRA: o tema solicitado pelo usuario + o nicho do negocio + o tom escolhido determinam de qual arquetipo a paleta vai puxar. CRUZE com as cores da marca quando informadas — ancore pelo menos 1 das 4 cores na identidade existente.
`.trim();

// Base de tendencias de design 2026 (atualizar quando o gosto da web mudar)
const DESIGN_TRENDS_2026 = `
TENDENCIAS DE DESIGN PARA INSTAGRAM/REDES SOCIAIS EM 2026:

1. TIPOGRAFIA MAXIMALISTA
   - Letras gigantes ocupando 60-80% do frame (Bebas Neue, Druk, Bricolage Grotesque, Reckless, PP Editorial New)
   - Palavras quebradas em multiplas linhas para criar tensao visual
   - Mistura de serifa moderna + sans-serif condensada

2. BRUTALISMO SUICO CONTROLADO
   - Grids visiveis, bordas pretas, espaco em branco generoso
   - Componentes parecendo "interface" (botoes, badges, tags)
   - Inspiracao em design suico classico, mas exagerado

3. CORES NEON SOBRE BASE NEUTRA
   - Fundos off-white, bege quente, cinza-papel ou preto profundo
   - Um (e SO um) ponto neon: lima eletric (#C8F135), magenta (#FF006E), tangerina (#FF6700), azul iridescente
   - O neon define hierarquia, nunca polui

4. Y2K REVIVAL + CYBER NOSTALGIA
   - Glow, motion blur, chrome, frutiger aero
   - Stickers, gifs, gradientes holograficos pontuais
   - Mas dosado: nao todo o post

5. AUTENTICIDADE FOTOGRAFICA
   - Fotos de celular com leve grao
   - Imperfeicao deliberada (papel amassado, ruido)
   - Nunca stock photo limpo demais

6. CARROSSEL STORYTELLING
   - Slide 1: hook gigante (tipografia + 1 cor de destaque)
   - Slides 2-7: minimalista, foco em uma ideia por slide
   - Slide final: CTA forte com botao falso (parece interativo)
   - Setas/numeros sutis indicando "deslize"

7. ELEMENTOS ORGANICOS
   - Blobs 3D, formas liquidas, hand-drawn scribbles
   - Quebram a rigidez do grid

8. CONTRASTE EXTREMO TEXT/BG
   - Preto sobre lima, lima sobre preto
   - Sem cinza no meio: a leitura no feed exige decisao binaria de cor

9. MOBILE-FIRST 4:5 (1080x1350)
   - Composicao vertical sempre
   - Texto importante no terco superior

10. ANTI-DESIGN INTENCIONAL
    - Quebrar 1 regra de design (alinhamento off, fonte misturada) gera atencao
`.trim();

function describeBusiness(business: Record<string, unknown> | null) {
  if (!business) return "Perfil de negocio nao informado.";
  return `
- Negocio: ${business.business_name || "nao informado"}
- Nicho: ${business.niche || "nao informado"}
- Publico-alvo: ${business.target_audience || "nao informado"}
- Estilo de comunicacao: ${business.communication_style || "nao informado"}
- Objetivo principal: ${business.main_goal || "nao informado"}
- Descricao da marca: ${business.brand_description || "nao informado"}
- Instagram: @${business.instagram_handle || "nao informado"}
- Cores da marca: ${(business.brand_colors as string[] | undefined)?.join(", ") || "nao definidas"}
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
Voce e um diretor de arte + copywriter especialista em Instagram que cria posts
extremamente personalizados para cada negocio. Voce conhece o estado da arte do
design para redes em 2026.

PERFIL DO NEGOCIO:
${describeBusiness(business)}

BRIEFING DO POST:
- Tema/topico solicitado pelo usuario: ${topic}
- Formato desejado: ${format}
- Objetivo do post: ${objective}
- Tom adicional (se informado): ${tone || "respeitar o estilo do negocio acima"}
- Observacoes extras: ${extraNotes || "nenhuma"}

${PALETTE_PLAYBOOK}

${DESIGN_TRENDS_2026}

ANALISE DE PALETA — OBRIGATORIO ANTES DE ESCOLHER CORES:
Pense passo a passo (mas NAO escreva o raciocinio no JSON, so use):
1. Qual EMOCAO e ARQUETIPO o tema acima evoca? (energia, calma, sofisticacao, urgencia, nostalgia, autoridade, ternura...)
2. Qual o publico-alvo do negocio? Que faixa etaria e gosto visual?
3. O negocio tem cores de marca? Se sim, uma das 4 cores PRECISA ancorar nelas.
4. Qual arquetipo do PLAYBOOK acima melhor representa esse tema + esse negocio?
5. Como o objetivo "${objective}" influencia a saturacao? (vendas/urgencia = mais saturado; autoridade = mais sobrio).

So entao escolha as 4 cores. NUNCA repita a paleta default preto/lima — cada tema gera paleta propria. Diferentes temas pro MESMO negocio devem gerar paletas DIFERENTES.

REGRAS DE GERACAO:
1. NUNCA gere conteudo generico — TUDO deve refletir o nicho e a marca acima.
2. O hook precisa parar o scroll em 1 segundo.
3. A legenda deve ter quebras de linha estrategicas para legibilidade no Instagram.
4. Os hashtags: 8 a 15 itens, mistura de hashtags amplas (#marketing) + nicho (#${(business?.niche as string) || "nicho"}) + comunidade local quando fizer sentido.
5. Para carrossel: 4 a 7 slides, cada slide tem 1 ideia clara.
6. O briefing visual deve ser EXECUTAVEL: alguem com Canva consegue produzir.
7. As tendencias 2026 devem estar PRESENTES no briefing visual mas adaptadas ao tom do negocio.
8. Use linguagem direta, sem jargao publicitario.
9. A paleta DEVE ter exatamente 4 cores: uma "fundo", uma "destaque", uma "texto", uma "secundaria". Cada role aparece UMA UNICA VEZ. Contraste fundo x texto >= 4.5:1 (legibilidade).
10. Escolha UM layout_template do enum abaixo que case com o tom do tema.

FORMATO DE RESPOSTA OBRIGATORIO:
Responda APENAS com um JSON valido, sem markdown, sem comentarios, sem texto antes ou depois. O JSON DEVE seguir exatamente este shape:

{
  "format": "single" | "carousel" | "reel",
  "caption": {
    "hook": "string (a primeira linha que para o scroll, max 120 caracteres)",
    "body": "string (corpo da legenda com quebras de linha \\n)",
    "cta": "string (chamada para acao final)"
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
    "concept": "frase de uma linha resumindo a peca",
    "style_keywords": ["palavra1", "palavra2"],
    "palette": [
      { "name": "Nome da cor", "hex": "#000000", "role": "fundo" },
      { "name": "Nome da cor", "hex": "#FFFFFF", "role": "texto" },
      { "name": "Nome da cor", "hex": "#FF6700", "role": "destaque" },
      { "name": "Nome da cor", "hex": "#666666", "role": "secundaria" }
    ],
    "palette_rationale": "1 frase explicando por que essa paleta combina com este tema especifico",
    "typography": {
      "display": "Nome da fonte display (use as do briefing 2026 quando combinar)",
      "body": "Nome da fonte body",
      "treatment": "como tratar a tipografia"
    },
    "layout": "descricao da composicao",
    "layout_template": "typography_oversized" | "side_block" | "asymmetric_brutal" | "frame_card" | "swiss_grid",
    "elements": ["elemento1", "elemento2"]
  },
  "trend_tips": ["dica 1", "dica 2", "dica 3"],
  "post_time_suggestion": "horario sugerido para postar e por que",
  "vibe_summary": "uma frase resumindo a vibe do post"
}

REGRAS DO JSON:
- "carousel_slides" so deve estar populado se "format" == "carousel". Em outros formatos, devolver array vazio [].
- Paleta: SEMPRE incluir EXATAMENTE 4 cores, uma para cada role (fundo, texto, destaque, secundaria). Cada role aparece UMA UNICA VEZ.
- Trend tips: entre 3 e 5 dicas, cada uma referenciando uma das 10 tendencias do briefing 2026.
- Hex sempre em formato #RRGGBB (6 digitos).
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

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY nao configurada. Adicione a chave em .env.local e reinicie o servidor.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const topic = (body.topic || "").trim();
  if (!topic) {
    return NextResponse.json(
      { error: "Informe um topico ou tema para o post." },
      { status: 400 },
    );
  }
  if (topic.length > 600) {
    return NextResponse.json(
      { error: "Topico muito longo (limite 600 caracteres)." },
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

        return NextResponse.json({ ok: true, post: parsed, model: modelId });
      } catch (parseErr) {
        lastError = parseErr;
        console.warn(
          `[create-post] modelo ${modelId} respondeu mas JSON nao parseou. Tentando proximo modelo.`,
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
        "Nao foi possivel gerar o post agora. Tente novamente em alguns segundos.",
      detail: lastError instanceof Error ? lastError.message : String(lastError),
    },
    { status: 502 },
  );
}
