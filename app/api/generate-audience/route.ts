import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
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
1. A descrição deve incluir: faixa etária, gênero (quando relevante), localização, classe social, interesses específicos, comportamentos de compra, dores e estilo de vida.
2. Seja ESPECÍFICO para o nicho ${niche}
3. A descrição deve ter entre 100 e 200 palavras
4. Responda APENAS com a descrição do público-alvo, sem títulos, sem explicações adicionais, sem aspas.`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ audience: text.trim() }), {
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
