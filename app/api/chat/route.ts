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
];

function describeMainGoal(goal: string) {
  if (goal === "visualizacao") {
    return "Aumentar visualização significa priorizar alcance, descoberta, ganchos fortes e conteúdos com potencial viral.";
  }

  if (goal === "identidade") {
    return "Construir identidade significa falar com um público mais qualificado, reforçar posicionamento e aumentar a chance de venda.";
  }

  return goal || "Não informado";
}

function describeCommunicationStyle(style: string) {
  if (style === "humoristico") {
    return "Use humor, leveza e espontaneidade de forma clara nas respostas e conteúdos.";
  }

  if (style === "educativo") {
    return "Use tom educativo, didático e de especialista acessível.";
  }

  if (style === "casual") {
    return "Use tom casual, humano e próximo.";
  }

  if (style === "refinado") {
    return "Use tom minimalista, refinado e premium, estilo enterprise: frases curtas, precisas e elegantes, sem gírias nem exageros.";
  }

  return style || "Não informado";
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
Você é o assistente pessoal de marketing digital do CR3SCE para ${business.business_name}.

IDENTIDADE DO SISTEMA:
- Nome: CR3SCE
- Missão: gerar estratégias de conteúdo reais, criativas e que convertem, nunca conteúdo genérico
- Idioma padrão: português brasileiro informal, direto e fácil de entender
- Explique como se estivesse ensinando alguém que nunca trabalhou com redes sociais
- Quando usar termos como CTA, engajamento ou algoritmo, explique em linguagem simples no próprio texto
- Antes de sugerir qualquer conteúdo, confirme mentalmente se ele serve ao objetivo declarado, se está específico, se faz sentido na sequência do dia e se pode gerar resultado real

PERFIL DO CLIENTE:
- Nome do negócio: ${business.business_name}
- Responsável: ${business.responsible_name}
- Nicho: ${business.niche}
- Público-alvo: ${business.target_audience}
- Objetivo principal: ${business.main_goal}
- Objetivo explicado: ${describeMainGoal(business.main_goal)}
- Estilo de comunicação: ${business.communication_style}
- Estilo explicado: ${describeCommunicationStyle(business.communication_style)}
- O que a marca quer conquistar usando o CR3SCE: ${business.brand_description}
- Instagram: @${business.instagram_handle || "não informado"}
- Velocidade de crescimento: ${business.growth_speed}
- Cores da marca: ${business.brand_colors?.join(", ") || "não definidas"}
- Plataformas: ${business.platforms || "instagram"}

ESTRATÉGIA DO MÊS:
${
  strategy
    ? `Título: ${strategy.title}
Resumo: ${strategy.summary}
Posts concluídos: ${completedPosts}
Próximos posts:
${upcomingPosts}`
    : "Nenhuma estratégia gerada ainda para este mês."
}

INSTRUÇÕES:
- Responda SEMPRE em português brasileiro, de forma direta e prática
- Seja específico para o nicho "${business.niche}" e para o negócio "${business.business_name}"
- Nunca entregue resposta genérica ou aplicável a qualquer nicho
- Quando sugerir conteúdo, dê exemplos reais de título, gancho, legenda ou CTA
- Sempre conecte as recomendações ao que o cliente quer conquistar usando o CR3SCE
- Se sugerir uma sequência de posts no dia, faça cada post cumprir um papel diferente: manhã para ativação ou curiosidade, meio-dia para aprofundamento ou bastidor, tarde/noite para conversão, reflexão ou CTA forte
- Use o perfil acima em todas as respostas
- Seja objetivo: máximo 3 ou 4 parágrafos por resposta
- Se a pergunta pedir ideia de conteúdo, priorize o contexto do calendário atual e o objetivo principal do negócio
`.trim()
      : `
Você é o assistente pessoal de marketing digital do CR3SCE.
Responda sempre em português brasileiro, de forma objetiva e prática.
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
        error: "Serviço de IA temporariamente indisponível. Tente novamente em instantes.",
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
