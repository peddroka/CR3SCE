import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "" });

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { investment_amount, business, month_number, current_followers } =
      await req.json();

    const prompt = `Voce e um especialista em marketing digital e crescimento de negocios brasileiros.

Crie uma jornada de evolucao personalizada para o seguinte negocio:

NEGOCIO: ${business.business_name}
NICHO: ${business.niche}
OBJETIVO: ${business.main_goal}
PLATAFORMA: ${business.platforms}
INVESTIMENTO DISPONIVEL: R$${investment_amount}
SEGUIDORES ATUAIS: ${current_followers}
MES: ${month_number}

INSTRUCOES IMPORTANTES:
1. As recomendacoes devem ser ESPECIFICAS para o nicho "${business.niche}" - nao genericas
2. Cada nivel deve ter exatamente 2 opcoes de investimento relevantes para este nicho
3. Os valores devem caber dentro do orcamento de R$${investment_amount}
4. Pense em: equipamentos especificos do nicho, acoes de marketing do setor, parcerias relevantes
5. Exemplos por nicho:
   - Padaria: fotos de produto, embalagem personalizada, delivery, influenciador alimenticio
   - Moda: ensaio fotografico, modelo, lookbook, parceria com blogueira de moda
   - Academia: video de treino, antes/depois, personal online, parceria com nutri
   - Advocacia: producao de conteudo educativo, webinar juridico, LinkedIn ads
6. Crie entre 3 e 5 niveis dependendo do orcamento (mais orcamento = mais niveis)

Responda APENAS com JSON valido, sem markdown:
{
  "levels": [
    {
      "level_number": 1,
      "title": "titulo do nivel especifico para ${business.niche}",
      "description": "descricao do que sera feito neste nivel",
      "reward": "resultado esperado ao completar este nivel",
      "options": [
        {
          "id": "1a",
          "icon": "emoji relevante",
          "title": "nome do investimento especifico para ${business.niche}",
          "description": "descricao de como isso vai ajudar especificamente ${business.business_name}",
          "price": "R$XX-XX"
        },
        {
          "id": "1b",
          "icon": "emoji relevante",
          "title": "segunda opcao especifica para ${business.niche}",
          "description": "descricao de como isso vai ajudar especificamente ${business.business_name}",
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
          error: "Nao foi possivel gerar a jornada. Tente novamente.",
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
