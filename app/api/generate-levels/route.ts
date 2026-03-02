import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const maxDuration = 60;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const levelSchema = z.object({
  number: z.number(),
  title: z.string(),
  type: z.enum(["equipment", "goal", "action"]),
  description: z.string(),
  tip: z.string(),
  estimated_cost: z.number(),
  expected_result: z.string(),
});

const responseSchema = z.object({
  levels: z.array(levelSchema),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { investment_amount, business, month_number, current_followers } =
      body;

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

    const prompt = `Você é um consultor de marketing digital especializado em growth marketing.
Com base nos dados abaixo, crie uma jornada de crescimento personalizada com níveis desbloqueáveis para este mês.

DADOS DO NEGÓCIO:
- Negócio: ${business.business_name}
- Nicho: ${business.niche}
- Objetivo principal: ${business.main_goal}
- Público-alvo: ${business.target_audience}
- Estilo de comunicação: ${business.communication_style}
- Velocidade de crescimento: ${business.growth_speed || "moderado"}
- Seguidores atuais: ${current_followers || "não informado"}
- Instagram: ${business.instagram_handle || "não informado"}

INVESTIMENTO DISPONÍVEL: R$ ${investment_amount}
MÊS DA JORNADA: ${month_number} ${month_number === 1 ? "(primeiro mês)" : month_number === 2 ? "(segundo mês)" : "(mês avançado)"}

REGRAS IMPORTANTES:
1. Gere entre 3 e 6 níveis, baseado no valor do investimento (mais investimento = mais níveis)
2. Distribua os custos de forma que a soma total NÃO ULTRAPASSE R$ ${investment_amount}
3. Misture diferentes tipos de níveis:
   - equipment: equipamentos físicos (câmera, luz, microfone, tripé)
   - goal: metas de crescimento (atingir X seguidores, Y views)
   - action: ações de marketing (anúncio, parceria, conteúdo especial)
4. Seja EXTREMAMENTE ESPECÍFICO para o nicho ${business.niche}
5. Ordene do mais barato/fácil para o mais caro/difícil
6. As dicas (tip) devem ser personalizadas para este negócio específico
7. Os resultados esperados devem ser realistas

EXEMPLOS DE NÍVEIS BEM ESTRUTURADOS:

Para nicho de moda:
{
  "number": 1,
  "title": "Kit de Iluminação para Fotos de Produto",
  "type": "equipment",
  "description": "Adquirir um softbox ou anel de luz para melhorar a qualidade das fotos de roupas e acessórios.",
  "tip": "Para sua loja de moda plus size, foque em iluminação que valorize as texturas dos tecidos e o caimento das peças. Posicione a luz em 45 graus para evitar sombras duras.",
  "estimated_cost": 200,
  "expected_result": "Fotos com aspecto profissional aumentando conversão em 20%"
}

Para nicho de gastronomia:
{
  "number": 2,
  "title": "Microfone Lapela para Receitas",
  "type": "equipment",
  "description": "Adquirir um microfone sem fio para capturar áudio de qualidade nos vídeos de receitas.",
  "tip": "No seu restaurante, use o microfone para narrar o preparo dos pratos enquanto mostra os ingredientes. O som ambiente da cozinha (panelas, fritura) cria imersão.",
  "estimated_cost": 150,
  "expected_result": "Vídeos com áudio profissional aumentando tempo de visualização"
}

Para nicho de fitness:
{
  "number": 3,
  "title": "Parceria com Influenciador Local",
  "type": "action",
  "description": "Investir em parceria com micro-influenciador da sua cidade para divulgar seus treinos.",
  "tip": "Procure influenciadores que já tenham público alinhado com sua academia (pessoas que buscam emagrecimento ou ganho de massa). Ofereça 3 meses grátis em troca de posts.",
  "estimated_cost": 300,
  "expected_result": "+200 seguidores qualificados e 10 novos alunos"

Responda APENAS em JSON com a estrutura especificada.`;

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: responseSchema,
      prompt,
      temperature: 0.7,
    });

    const levelsData = result.object.levels;

    // Salvar níveis no banco
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Primeiro nível fica available, resto locked
    const levelsToInsert = levelsData.map((level, index) => ({
      user_id: user.id,
      business_id: business.id,
      month,
      year,
      level_number: level.number,
      title: level.title,
      type: level.type,
      description: level.description,
      tip: level.tip,
      estimated_cost: level.estimated_cost,
      expected_result: level.expected_result,
      status: index === 0 ? "available" : "locked",
    }));

    const { data: savedLevels, error } = await supabase
      .from("evolution_levels")
      .insert(levelsToInsert)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ levels: savedLevels }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao gerar níveis:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar níveis" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
