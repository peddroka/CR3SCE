import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const postSchema = z.object({
  time: z.string(),
  content_type: z.string(),
  topic: z.string(),
  script: z.string(),
  hashtags: z.string(),
  completed: z.boolean().default(false),
});

const daySchema = z.object({
  day_number: z.number(),
  posts: z.array(postSchema),
});

const responseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z.array(daySchema),
});

export async function POST(req: Request) {
  console.log("🚀 API de estratégia iniciada");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("👤 Usuário:", user?.id);

    if (!user) {
      console.log("❌ Usuário não autorizado");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { month, year } = body;
    console.log("📅 Mês/Ano:", month, year);

    // Fetch business data
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    console.log("💼 Business:", business?.business_name);
    console.log("📊 Velocidade de crescimento:", business?.growth_speed);

    if (!business) {
      console.log("❌ Business não encontrado");
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    console.log("📆 Dias no mês:", daysInMonth);

    // Determinar frequência de posts baseado na velocidade de crescimento
    let frequencyInstruction = "";
    let targetDays = 0;
    let postsPerDayInstruction = "";

    if (business.growth_speed === "rapido") {
      frequencyInstruction = `IMPORTANTE: O usuário SELECIONOU CRESCIMENTO RÁPIDO no questionário. 
      Gere posts para TODOS OS ${daysInMonth} DIAS do mês, SEM EXCEÇÃO. 
      NÃO PULE NENHUM DIA. Cada dia DEVE ter 2 posts (manhã e noite).`;
      targetDays = daysInMonth;
      postsPerDayInstruction =
        "Cada dia deve ter EXATAMENTE 2 posts: um pela manhã (8h-11h) e um pela noite (18h-21h)";
      console.log(
        "✅ Modo RÁPIDO ativado - posts para TODOS OS DIAS com 2 posts por dia",
      );
    } else if (business.growth_speed === "moderado") {
      frequencyInstruction = `IMPORTANTE: O usuário SELECIONOU CRESCIMENTO MODERADO no questionário.
      Gere posts para dias alternados (cerca de 15-16 dias no mês). 
      Cada dia deve ter 1-2 posts.`;
      targetDays = 16;
      postsPerDayInstruction =
        "Distribua os posts alternando entre 1 e 2 posts por dia";
      console.log("✅ Modo MODERADO ativado - posts em dias alternados");
    } else {
      frequencyInstruction = `IMPORTANTE: O usuário SELECIONOU CRESCIMENTO LEVE no questionário.
      Gere posts para 2-3 vezes por semana (cerca de 8-12 dias no mês). 
      Cada dia deve ter 1 post.`;
      targetDays = 10;
      postsPerDayInstruction = "Cada dia de post deve ter APENAS 1 post";
      console.log("✅ Modo LEVE ativado - posts 2-3x por semana");
    }

    // Dicas de horário por nicho
    let timeTips = "";
    if (
      business.niche.toLowerCase().includes("doceria") ||
      business.niche.toLowerCase().includes("doce") ||
      business.niche.toLowerCase().includes("confeitaria")
    ) {
      timeTips =
        "Para docerias: foque em horários de pico (10h, 15h, 19h) - horários que as pessoas buscam doces após refeições.";
    } else if (
      business.niche.toLowerCase().includes("hamburguer") ||
      business.niche.toLowerCase().includes("burger") ||
      business.niche.toLowerCase().includes("lanche")
    ) {
      timeTips =
        "Para hamburguerias: foque em horários noturnos (19h-22h) - jantar e fome noturna.";
    } else if (
      business.niche.toLowerCase().includes("cafeteria") ||
      business.niche.toLowerCase().includes("café")
    ) {
      timeTips =
        "Para cafeterias: foque em horários da manhã e tarde (8h-17h) - café da manhã, almoço e café da tarde.";
    } else if (
      business.niche.toLowerCase().includes("ótica") ||
      business.niche.toLowerCase().includes("óculos")
    ) {
      timeTips =
        "Para óticas: foque em horários variados - manhã (10h) para conteúdos educativos, tarde (15h) para dicas, noite (19h) para promoções.";
    } else if (
      business.niche.toLowerCase().includes("moda") ||
      business.niche.toLowerCase().includes("roupa")
    ) {
      timeTips =
        "Para moda: foque em horários: 10h (look do dia), 15h (dicas de combinação), 20h (lançamentos).";
    } else {
      timeTips =
        "Distribua os posts em diferentes horários: manhã (8h-11h), tarde (12h-15h), noite (18h-21h) para atingir diferentes públicos.";
    }

    // Garantir que o título seja personalizado e profissional
    const prompt = `Você é um social media profissional especialista em marketing digital.
Crie uma estratégia de conteúdo MENSAL detalhada e PERSONALIZADA para o negócio abaixo.

DADOS DO NEGÓCIO (DO QUESTIONÁRIO):
- Nome: ${business.business_name}
- Nicho: ${business.niche}
- Público-alvo: ${business.target_audience}
- Objetivo principal: ${business.main_goal} (${business.main_goal === "seguidores" ? "GANHAR SEGUIDORES" : ""})
- Plataformas: ${business.platforms} (foco em Instagram)
- Estilo de comunicação: ${business.communication_style}
- Velocidade de crescimento: ${business.growth_speed} (ESCOLHA DO USUÁRIO NO QUESTIONÁRIO)
- Descrição da marca: ${business.brand_description}
- Diferencial: ${business.unique_value || "não informado"}

MÊS: ${month}/${year} (${daysInMonth} dias)

${frequencyInstruction}

${postsPerDayInstruction}

OUTRAS REGRAS IMPORTANTES:
1. O TÍTULO de cada post deve ser CHAMATIVO e PERSONALIZADO para o nicho ${business.niche}
2. Varie os tipos de conteúdo (Reels, Carrossel, Stories, Post Estático)
3. ${timeTips}
4. Cada post deve ter um ROTEIRO COMPLETO E DETALHADO com:
   - PASSO A PASSO do que filmar/mostrar
   - O que falar (narração completa)
   - Como se comportar
   - Call to action no final

EXEMPLO DE POST BEM ESTRUTURADO (para moda plus size):
{
  "time": "10:00",
  "content_type": "Reels",
  "topic": "5 looks plus size para o trabalho com 1 peça curinga",
  "script": "PASSO 1: Mostre a peça curinga (blazer preto) e explique que ela pode transformar qualquer look.\\nPASSO 2: Primeiro look: blazer + calça social + camisa básica (look executivo).\\nPASSO 3: Segundo look: blazer + vestido liso (look moderno).\\nPASSO 4: Terceiro look: blazer + jeans + regata (look casual).\\nPASSO 5: Mostre todos os looks juntos e finalize.\\n\\nNARRAÇÃO: 'Com um blazer preto você cria 5 looks diferentes para o trabalho! Na Loja Plus Size, temos blazers com modelagem perfeita para o corpo real. Qual você usaria amanhã? Conta aqui nos comentários!'",
  "hashtags": "#modaplus #plusstyle #lookdotrabalho #modafeminina #blazer"
}

Agora crie a estratégia completa para ${business.business_name} no nicho ${business.niche}.

IMPORTANTE: Siga ESTRITAMENTE a velocidade de crescimento escolhida pelo usuário: ${business.growth_speed}
- Se for RÁPIDO: posts para TODOS os ${daysInMonth} dias, com 2 posts por dia (manhã e noite)
- Se for MODERADO: posts para dias alternados (cerca de 16 dias), com 1-2 posts por dia
- Se for LEVE: posts para 2-3x por semana (cerca de 10 dias), com 1 post por dia

Os TÍTULOS dos posts devem ser criativos e chamar atenção do público-alvo.

Responda APENAS em JSON com a estrutura especificada.`;

    console.log("🤖 Chamando GROQ API...");
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: responseSchema,
      prompt,
      temperature: 0.8,
    });

    const strategyData = result.object;
    console.log("✅ Estratégia gerada:", strategyData.title);
    console.log("📊 Total de dias na resposta:", strategyData.days.length);

    // Verificar se a IA respeitou a velocidade de crescimento
    const daysWithPosts = strategyData.days.filter((d) => d.posts.length > 0);
    console.log("📊 Dias com posts gerados:", daysWithPosts.length);

    // VALIDAÇÃO FORÇADA - Se for rápido e não gerou todos os dias, ajustar
    if (
      business.growth_speed === "rapido" &&
      daysWithPosts.length < daysInMonth
    ) {
      console.log(
        "⚠️ ATENÇÃO: IA não gerou posts para todos os dias. Ajustando...",
      );

      // Criar dias faltantes
      const existingDays = new Set(daysWithPosts.map((d) => d.day_number));
      const missingDays = [];

      for (let i = 1; i <= daysInMonth; i++) {
        if (!existingDays.has(i)) {
          missingDays.push(i);
        }
      }

      console.log(`📆 Dias faltantes: ${missingDays.join(", ")}`);

      // Gerar posts para dias faltantes baseado em dias existentes
      const templatePost = daysWithPosts[0]?.posts[0] || {
        time: "10:00",
        content_type: "Reels",
        topic: "Conteúdo para crescimento rápido",
        script:
          "PASSO 1: Mostre seu produto/serviço em uso.\nPASSO 2: Destaque os benefícios.\nPASSO 3: Mostre depoimentos de clientes.\nPASSO 4: Faça uma oferta especial.\n\nNARRAÇÃO: 'Quer resultados como esses? Vem com a gente!'",
        hashtags: "#marketing #crescimento #resultados",
        completed: false, // ADICIONADO completed
      };

      const templatePost2 = {
        time: "19:00",
        content_type: "Carrossel",
        topic: "Dicas rápidas para resultados incríveis",
        script:
          "Slide 1: Capa chamativa\nSlide 2: Dica 1\nSlide 3: Dica 2\nSlide 4: Dica 3\nSlide 5: Chamada para ação",
        hashtags: "#dicas #aprenda #resultados",
        completed: false, // ADICIONADO completed
      };

      missingDays.forEach((dayNum) => {
        strategyData.days.push({
          day_number: dayNum,
          posts: [
            { ...templatePost, time: "10:00", completed: false },
            { ...templatePost2, time: "19:00", completed: false },
          ],
        });
      });

      // Reordenar dias
      strategyData.days.sort((a, b) => a.day_number - b.day_number);

      console.log(
        "✅ Dias ajustados manualmente. Agora com:",
        strategyData.days.length,
        "dias",
      );
    }

    // Verificar número de posts por dia no modo rápido
    if (business.growth_speed === "rapido") {
      let adjusted = false;
      strategyData.days.forEach((day) => {
        if (day.posts.length < 2) {
          // Adicionar segundo post com completed: false
          day.posts.push({
            time: "19:00",
            content_type:
              day.posts[0].content_type === "Reels" ? "Carrossel" : "Reels",
            topic: `[BÔNUS] Continuação: ${day.posts[0].topic}`,
            script:
              "PASSO 1: Reforce a mensagem principal.\nPASSO 2: Mostre um exemplo prático.\nPASSO 3: Pergunte ao público.\n\nNARRAÇÃO: 'E aí, curtiu a dica de hoje? Compartilha com quem precisa ver isso!'",
            hashtags: day.posts[0].hashtags,
            completed: false, // ADICIONADO completed
          });
          adjusted = true;
        }
      });
      if (adjusted) {
        console.log(
          "✅ Ajustado: dias com menos de 2 posts receberam segundo post",
        );
      }
    }

    // Inserir estratégia
    console.log("💾 Inserindo estratégia no banco...");
    const { data: strategy, error: insertError } = await supabase
      .from("strategies")
      .insert({
        business_id: business.id,
        user_id: user.id,
        title: strategyData.title,
        summary: strategyData.summary,
        month,
        year,
      })
      .select()
      .single();

    if (insertError) {
      console.log("❌ Erro ao inserir estratégia:", insertError);
      throw insertError;
    }
    console.log("✅ Estratégia inserida com ID:", strategy.id);

    // Preparar dias com posts - GARANTINDO que todos os posts tenham a propriedade 'completed'
    const daysData = strategyData.days.map((day) => {
      // Garantir que cada post tenha a propriedade completed
      const personalizedPosts = day.posts.map((post) => ({
        time: post.time,
        content_type: post.content_type,
        topic: post.topic,
        script: post.script,
        hashtags: post.hashtags,
        completed: false, // SEMPRE definir como false inicialmente
      }));

      return {
        strategy_id: strategy.id,
        user_id: user.id,
        day_number: day.day_number,
        // Campos obrigatórios (usar primeiro post)
        content_type: personalizedPosts[0].content_type,
        topic: personalizedPosts[0].topic,
        // Campos opcionais
        caption_idea: personalizedPosts[0].script,
        best_time: personalizedPosts[0].time,
        hashtags: personalizedPosts[0].hashtags,
        completed: false,
        // Posts completos em JSONB - TODOS com completed: false
        posts: personalizedPosts,
      };
    });

    console.log("📦 Dias a serem inseridos:", daysData.length);

    // Inserir dias
    const { error: daysError, data: insertedDays } = await supabase
      .from("strategy_days")
      .insert(daysData)
      .select();

    if (daysError) {
      console.log("❌ Erro ao inserir dias:", daysError);
      throw daysError;
    }

    console.log("✅ Dias inseridos com sucesso:", insertedDays?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        strategy,
        daysCount: daysData.length,
        growthSpeed: business.growth_speed,
        expectedDays:
          business.growth_speed === "rapido" ? daysInMonth : daysData.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("❌ Erro ao gerar estratégia:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar estratégia" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
