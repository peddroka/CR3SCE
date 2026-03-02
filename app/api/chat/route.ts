import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  // Fetch business context
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Buscar dados de evolução
  const { data: evolutionData } = await supabase
    .from("evolution_data")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: completedLevels } = await supabase
    .from("evolution_levels")
    .select("title, type")
    .eq("user_id", user.id)
    .eq("status", "completed");

  // Buscar estratégia atual
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*, strategy_days(*)")
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const strategy = strategies?.[0];
  let completedPosts = 0;

  if (strategy?.strategy_days) {
    strategy.strategy_days.forEach((day: any) => {
      if (day.posts) {
        completedPosts += day.posts.filter((p: any) => p.completed).length;
      }
    });
  }

  const systemPrompt = `Você é a Cresci.IA, uma assistente de marketing digital altamente especializada. 
Você ajuda empreendedores brasileiros a crescerem seus negócios nas redes sociais.
Sempre responda em português brasileiro. Seja prática, direta e amigável.

${
  business
    ? `CONTEXTO COMPLETO DO NEGÓCIO:
- Nome: ${business.business_name}
- Nicho: ${business.niche}
- Público-alvo: ${business.target_audience}
- Objetivo: ${business.main_goal}
- Plataformas: ${business.platforms}
- Estilo de comunicação: ${business.communication_style}
- Velocidade de crescimento: ${business.growth_speed || "moderado"}
- Descrição da marca: ${business.brand_description}
- Diferencial: ${business.unique_value || "não informado"}
- Instagram: ${business.instagram_handle || "não informado"}
- Responsável: ${business.responsible_name || "não informado"}

DADOS DE EVOLUÇÃO:
- Seguidores atuais: ${evolutionData?.current_followers || "não informado"}
- Views médias Stories: ${evolutionData?.current_stories_views || "não informado"}
- Investimento mensal: R$ ${evolutionData?.monthly_investment || "não informado"}
- Níveis conquistados: ${completedLevels?.map((l) => l.title).join(", ") || "nenhum ainda"}

ESTRATÉGIA ATUAL:
${
  strategy
    ? `- Mês: ${strategy.month}/${strategy.year}
- Missões concluídas: ${completedPosts}`
    : "- Nenhuma estratégia ativa ainda"
}

Use TODO esse contexto para personalizar suas respostas e sugestões de marketing.`
    : "O usuário ainda não configurou seu negócio."
}`;

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
