import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const audienceSchema = z.object({
  audience: z
    .string()
    .describe("Descrição detalhada do público-alvo em português"),
});

export async function POST(req: Request) {
  try {
    const { business_name, niche } = await req.json();

    if (!business_name || !niche) {
      return new Response(
        JSON.stringify({ error: "Nome do negócio e nicho são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const prompt = `Você é um especialista em marketing digital e criação de personas.
Com base no negócio e nicho abaixo, crie uma descrição DETALHADA e ESPECÍFICA do público-alvo ideal.

Negócio: ${business_name}
Nicho: ${niche}

REGRAS:
1. A descrição deve ser COMPLETA e incluir:
   - Idade ou faixa etária
   - Gênero (quando relevante)
   - Localização/região
   - Classe social ou poder aquisitivo
   - Interesses específicos relacionados ao nicho
   - Comportamentos de compra
   - Dores ou necessidades
   - Estilo de vida

2. Seja ESPECÍFICO para o nicho ${niche}
3. A descrição deve ter entre 100 e 200 palavras
4. Use linguagem profissional mas acessível
5. Responda APENAS com a descrição do público-alvo, sem explicações adicionais

Exemplo de boa descrição para "moda plus size":
"Mulheres de 25 a 45 anos, classes B e C, residentes em grandes centros urbanos do Brasil. São profissionais que trabalham em escritórios ou home office, valorizam a autoestima e buscam roupas que aliem conforto, estilo e boa modelagem para corpos reais. Interessadas em moda sustentável, seguem influenciadoras plus size no Instagram e TikTok, compram online com frequência (2-3 vezes por mês) e pesquisam avaliações antes de comprar. Dores principais: dificuldade em encontrar roupas modernas que vistam bem, tecidos que não marcam e lojas com variedade de tamanhos (do 44 ao 60). Buscam marcas que as representem e celebrem a diversidade corporal."

Agora crie uma descrição similar para ${business_name} no nicho de ${niche}.`;

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: audienceSchema,
      prompt,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ audience: result.object.audience }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao gerar público-alvo:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar público-alvo" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
