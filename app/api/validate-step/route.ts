import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const responseSchema = z.object({
  feedback: z
    .string()
    .nullable()
    .describe(
      "null se as respostas estão boas. String com sugestão amigável em português se puderem melhorar.",
    ),
});

export async function POST(req: Request) {
  try {
    const { step, data } = await req.json();

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: responseSchema,
      prompt: `Você é um consultor de marketing digital amigável e motivador.
Analise as respostas do step ${step} do questionário abaixo e dê feedback.

DADOS DO QUESTIONÁRIO:
${JSON.stringify(data, null, 2)}

REGRAS:
1. Se as respostas estão BOAS e ESPECÍFICAS, retorne null
2. Se alguma resposta estiver VAGA, GENÉRICA ou INCOMPLETA, dê uma sugestão curta e amigável
3. Seja gentil, nunca crítico. Use linguagem positiva e motivadora
4. Foque no campo público-alvo (target_audience) se estiver muito vago
5. Sugestões devem ser práticas e acionáveis

EXEMPLOS DE BOM FEEDBACK:
- "Que tal incluir a idade do seu público? Isso ajuda a criar conteúdo mais direcionado!"
- "Você pode especificar melhor os interesses do seu público. Eles gostam de moda, tecnologia, bem-estar?"
- "Adicionar a localização (cidade/região) pode ajudar a criar conteúdos mais relevantes!"

EXEMPLOS DE RESPOSTAS BOAS (retornar null):
- "Mulheres de 25-40 anos, classe média, de São Paulo, interessadas em moda sustentável e bem-estar"
- "Homens de 30-45 anos, empreendedores, que buscam conteúdo sobre produtividade e negócios"

Se as respostas forem boas, retorne null.
Se precisar de melhoria, retorne uma string com a sugestão.

Responda APENAS com o JSON especificado.`,
      temperature: 0.5,
    });

    return Response.json({ feedback: result.object.feedback });
  } catch (error) {
    console.error("Erro na validação:", error);
    return Response.json({ feedback: null });
  }
}
