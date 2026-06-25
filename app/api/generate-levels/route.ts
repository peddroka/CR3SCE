import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "" });

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { investment_amount, business, month_number, current_followers } =
      await req.json();

    const prompt = `Você é um especialista em marketing digital e crescimento de negócios brasileiros.

Crie uma jornada de evolução personalizada para o seguinte negócio:

NEGÓCIO: ${business.business_name}
NICHO: ${business.niche}
OBJETIVO: ${business.main_goal}
PLATAFORMA: ${business.platforms}
INVESTIMENTO DISPONÍVEL: R$${investment_amount}
SEGUIDORES ATUAIS: ${current_followers}
MÊS: ${month_number}

INSTRUÇÕES IMPORTANTES:
1. As recomendações devem ser ESPECÍFICAS para o nicho "${business.niche}" - não genéricas
2. Cada nível deve ter exatamente 2 opções de investimento relevantes para este nicho
3. Os valores devem caber dentro do orçamento de R$${investment_amount}
4. Pense em: equipamentos específicos do nicho, ações de marketing do setor, parcerias relevantes
5. Exemplos por nicho:
   - Padaria: fotos de produto, embalagem personalizada, delivery, influenciador alimentício
   - Moda: ensaio fotográfico, modelo, lookbook, parceria com blogueira de moda
   - Academia: vídeo de treino, antes/depois, personal online, parceria com nutri
   - Advocacia: produção de conteúdo educativo, webinar jurídico, LinkedIn ads
6. Crie entre 3 e 5 níveis dependendo do orçamento (mais orçamento = mais níveis)

Responda APENAS com JSON válido, sem markdown:
{
  "levels": [
    {
      "level_number": 1,
      "title": "título do nível específico para ${business.niche}",
      "description": "descrição do que será feito neste nível",
      "reward": "resultado esperado ao completar este nível",
      "options": [
        {
          "id": "1a",
          "icon": "emoji relevante",
          "title": "nome do investimento específico para ${business.niche}",
          "description": "descrição de como isso vai ajudar especificamente ${business.business_name}",
          "price": "R$XX-XX"
        },
        {
          "id": "1b",
          "icon": "emoji relevante",
          "title": "segunda opção específica para ${business.niche}",
          "description": "descrição de como isso vai ajudar especificamente ${business.business_name}",
          "price": "R$XX-XX"
        }
      ]
    }
  ]
}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta da IA" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!parsed?.levels || parsed.levels.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Não foi possível gerar a jornada. Tente novamente.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const now = new Date();

    for (const level of parsed.levels) {
      await supabase.from("evolution_levels").upsert({
        user_id: user.id,
        level_number: level.level_number,
        title: level.title,
        description: level.description,
        missions: level.missions,
        reward: level.reward,
        required_investment: level.required_investment || 0,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
    }

    return new Response(JSON.stringify({ levels: parsed.levels }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao gerar niveis:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
