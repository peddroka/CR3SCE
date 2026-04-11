import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

function describeMainGoal(goal: string) {
  if (goal === "visualizacao") {
    return "Aumentar visualizacao significa priorizar alcance, descoberta, ganchos fortes e conteudos com potencial viral.";
  }

  if (goal === "identidade") {
    return "Construir identidade significa falar com um publico mais qualificado, reforcar posicionamento e aumentar a chance de venda.";
  }

  return goal || "Nao informado";
}

function describeCommunicationStyle(style: string) {
  if (style === "humoristico") {
    return "Use humor, leveza e espontaneidade de forma clara nas respostas e conteudos.";
  }

  if (style === "educativo") {
    return "Use tom educativo, didatico e de especialista acessivel.";
  }

  if (style === "casual") {
    return "Use tom casual, humano e proximo.";
  }

  return style || "Nao informado";
}

function formatUpcomingPosts(strategyDays: any[] | undefined) {
  if (!strategyDays?.length) return "Nenhum post futuro encontrado.";

  const today = new Date().getDate();
  const upcoming = strategyDays
    .filter((day) => Number(day.day_number) >= today)
    .sort((a, b) => Number(a.day_number) - Number(b.day_number))
    .slice(0, 5);

  if (!upcoming.length) return "Nenhum post futuro encontrado.";

  return upcoming
    .map((day) => {
      const posts = Array.isArray(day.posts) ? day.posts : [];
      const items = posts
        .slice(0, 4)
        .map(
          (post: any) =>
            `Dia ${day.day_number} | ${post.content_type} | ${post.time} | ${post.topic}`,
        )
        .join("\n");

      return items;
    })
    .filter(Boolean)
    .join("\n");
}

function countCompletedPosts(strategyDays: any[] | undefined) {
  if (!strategyDays?.length) return 0;

  return strategyDays.reduce((total, day) => {
    const posts = Array.isArray(day.posts) ? day.posts : [];
    return total + posts.filter((post: any) => post.completed).length;
  }, 0);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = body.messages ?? [];
    const systemOverride = body.systemOverride as string | undefined;

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "No messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data: strategyRows } = await supabase
      .from("strategies")
      .select("*, strategy_days(*)")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .order("created_at", { ascending: false })
      .limit(1);

    const strategy = strategyRows?.[0] || null;
    const completedPosts = countCompletedPosts(strategy?.strategy_days);
    const upcomingPosts = formatUpcomingPosts(strategy?.strategy_days);

    const systemPrompt = business
      ? `
Voce e o assistente pessoal de marketing digital do CR3SCE para ${business.business_name}.

IDENTIDADE DO SISTEMA:
- Nome: CR3SCE
- Missao: gerar estrategias de conteudo reais, criativas e que convertem, nunca conteudo generico
- Idioma padrao: portugues brasileiro informal, direto e facil de entender
- Explique como se estivesse ensinando alguem que nunca trabalhou com redes sociais
- Quando usar termos como CTA, engajamento ou algoritmo, explique em linguagem simples no proprio texto
- Antes de sugerir qualquer conteudo, confirme mentalmente se ele serve ao objetivo declarado, se esta especifico, se faz sentido na sequencia do dia e se pode gerar resultado real

PERFIL DO CLIENTE:
- Nome do negocio: ${business.business_name}
- Responsavel: ${business.responsible_name}
- Nicho: ${business.niche}
- Publico-alvo: ${business.target_audience}
- Objetivo principal: ${business.main_goal}
- Objetivo explicado: ${describeMainGoal(business.main_goal)}
- Estilo de comunicacao: ${business.communication_style}
- Estilo explicado: ${describeCommunicationStyle(business.communication_style)}
- O que a marca quer conquistar usando o CR3SCE: ${business.brand_description}
- Instagram: @${business.instagram_handle || "nao informado"}
- Velocidade de crescimento: ${business.growth_speed}
- Cores da marca: ${business.brand_colors?.join(", ") || "nao definidas"}
- Plataformas: ${business.platforms || "instagram"}

ESTRATEGIA DO MES:
${
  strategy
    ? `Titulo: ${strategy.title}
Resumo: ${strategy.summary}
Posts concluidos: ${completedPosts}
Proximos posts:
${upcomingPosts}`
    : "Nenhuma estrategia gerada ainda para este mes."
}

INSTRUCOES:
- Responda SEMPRE em portugues brasileiro, de forma direta e pratica
- Seja especifico para o nicho "${business.niche}" e para o negocio "${business.business_name}"
- Nunca entregue resposta generica ou aplicavel a qualquer nicho
- Quando sugerir conteudo, de exemplos reais de titulo, gancho, legenda ou CTA
- Sempre conecte as recomendacoes ao que o cliente quer conquistar usando o CR3SCE
- Se sugerir uma sequencia de posts no dia, faca cada post cumprir um papel diferente: manha para ativacao ou curiosidade, meio-dia para aprofundamento ou bastidor, tarde/noite para conversao, reflexao ou CTA forte
- Use o perfil acima em todas as respostas
- Seja objetivo: maximo 3 ou 4 paragrafos por resposta
- Se a pergunta pedir ideia de conteudo, priorize o contexto do calendario atual e o objetivo principal do negocio
`.trim()
      : `
Voce e o assistente pessoal de marketing digital do CR3SCE.
Responda sempre em portugues brasileiro, de forma objetiva e pratica.
`.trim();

    let lastError: unknown = null;

    for (const modelId of MODELS) {
      try {
        const result = await streamText({
          model: groq(modelId),
          system: systemOverride || systemPrompt,
          messages,
          maxOutputTokens: 1024,
        });

        return result.toUIMessageStreamResponse({
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      } catch (modelError) {
        console.error(`Modelo ${modelId} falhou:`, modelError);
        lastError = modelError;
      }
    }

    console.error("Todos os modelos Groq falharam:", lastError);

    return new Response(
      JSON.stringify({
        error: "Servico de IA temporariamente indisponivel. Tente novamente em instantes.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Erro geral no chat:", error);

    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
