export const maxDuration = 30;

interface DetailRequest {
  id_publicacao?: string;
  estilo_id?: string;
  titulo?: string;
  tipo?: string;
  nicho?: string;
  tom_de_voz?: string;
  objetivo_usuario?: string;
  conectado_com?: string | null;
  horario?: string;
  horario_conectado?: string | null;
  titulo_conectado?: string | null;
  script?: string | null;
  legenda?: string | null;
  slides?: Array<{
    numero?: number;
    tipo?: string;
    texto_principal?: string;
    texto_secundario?: string;
  }> | null;
}

interface DetailStep {
  numero: number;
  instrucao: string;
  detalhe: string | null;
}

interface DetailNote {
  tipo: "aviso" | "dica";
  cor: "vermelho" | "verde";
  texto: string;
}

interface CarouselSlide {
  numero: number;
  tipo: string;
  texto_principal: string;
  texto_secundario?: string;
}

interface DetailResponse {
  titulo_exibido: string;
  tipo: string;
  roteiro: {
    introducao: string;
    passos: DetailStep[];
    avisos: DetailNote[];
    conexao_proximo: {
      existe: boolean;
      id_conectado: string | null;
      mensagem: string | null;
    };
  };
  guia_visual: {
    introducao: string;
    passos_visuais: DetailStep[];
    ferramentas_sugeridas: string[];
    dicas_visuais: DetailNote[];
  };
  slides?: CarouselSlide[] | null;
}

function sanitizeText(value: string) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return sanitizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getBaseType(inputType: string, styleId: string) {
  const normalizedType = normalizeText(inputType);

  if (normalizedType.includes("history") || styleId.startsWith("H")) return "HISTORY";
  if (normalizedType.includes("carrossel") || styleId.startsWith("F")) {
    return styleId === "F05" || styleId === "F06" || styleId === "F07" || styleId === "F12" || styleId === "F15"
      ? "FEED_FOTO"
      : "FEED_CARROSSEL";
  }
  if (normalizedType.includes("foto")) return "FEED_FOTO";
  return "REELS";
}

function getToneProfile(tone: string) {
  const normalized = normalizeText(tone);

  if (normalized.includes("formal")) {
    return {
      abertura: "Hoje eu quero te mostrar um ponto importante.",
      transicao: "O que mais faz diferença aqui é a clareza.",
      fechamento: "Se isso fizer sentido, leva esse ajuste para a prática ainda hoje.",
    };
  }

  if (normalized.includes("tecnic")) {
    return {
      abertura: "Presta atenção neste ponto porque ele muda a leitura do conteúdo.",
      transicao: "Quando você ajusta isso, a percepção de valor sobe.",
      fechamento: "Aplica desse jeito e observa como a resposta do público melhora.",
    };
  }

  if (normalized.includes("inspir")) {
    return {
      abertura: "Se você quer crescer com mais consistência, começa por aqui.",
      transicao: "Pequenos ajustes bem feitos mudam a forma como o público te enxerga.",
      fechamento: "Faz isso hoje porque a constância começa em movimentos simples.",
    };
  }

  return {
    abertura: "Deixa eu te mostrar um ponto que pode melhorar muito isso.",
    transicao: "Quando você fala disso com clareza, o público entende mais rápido.",
    fechamento: "Faz desse jeito e observa como a resposta tende a ficar melhor.",
  };
}

function getObjectiveAngle(goal: string) {
  const normalized = normalizeText(goal);

  if (normalized.includes("vend")) {
    return "gerar conversas mais próximas da venda";
  }

  if (normalized.includes("engaj")) {
    return "aumentar resposta e interação";
  }

  if (normalized.includes("segu") || normalized.includes("cres") || normalized.includes("visual")) {
    return "ganhar alcance com mais direção";
  }

  if (normalized.includes("autor")) {
    return "fortalecer sua autoridade";
  }

  return "fortalecer a presença do perfil";
}

function buildConnectedMessage(body: DetailRequest, baseType: string, styleId: string) {
  const connectedId = body.conectado_com || null;
  const connectedTime = sanitizeText(body.horario_conectado || "");
  const targetTime = connectedTime ? ` às ${connectedTime}` : "";

  if (!connectedId) {
    return {
      existe: false,
      id_conectado: null,
      mensagem: null,
    };
  }

  if (baseType === "HISTORY" && styleId === "H14") {
    return {
      existe: true,
      id_conectado: connectedId,
      mensagem: `Esse story está conectado com o de${targetTime}. Aqui você vai responder as perguntas que nasceram lá.`,
    };
  }

  return {
    existe: true,
    id_conectado: connectedId,
    mensagem: `Esse conteúdo está conectado com o de${targetTime}. No de${targetTime}, você vai continuar essa narrativa de forma natural.`,
  };
}

function buildStorySpeech(title: string, niche: string, tone: string, goal: string) {
  const toneProfile = getToneProfile(tone);
  const objective = getObjectiveAngle(goal);

  return `${toneProfile.abertura} Hoje eu quero falar sobre ${title.toLowerCase()} dentro de ${niche}. ${toneProfile.transicao} A ideia aqui é te ajudar a ${objective} sem complicar a mensagem. ${toneProfile.fechamento}`;
}

function buildStorySteps(body: DetailRequest, styleId: string, connectedMessage: DetailResponse["roteiro"]["conexao_proximo"]) {
  const niche = sanitizeText(body.nicho || "o seu nicho");
  const title = sanitizeText(body.titulo || "esse tema");
  const connectedTime = sanitizeText(body.horario_conectado || "");

  if (styleId === "H14") {
    return [
      {
        numero: 1,
        instrucao: connectedTime
          ? `Abra as respostas da caixinha que você postou às ${connectedTime}.`
          : "Abra as respostas da caixinha que você publicou antes deste story.",
        detalhe:
          "Escolha a primeira pergunta com mais potencial de gerar identificação ou conversa.",
      },
      {
        numero: 2,
        instrucao: "Grave um vídeo mostrando seu rosto e comece retomando a conversa anterior.",
        detalhe:
          "Use enquadramento dos ombros para cima, luz frontal e fundo limpo ou ambiente de trabalho.",
      },
      {
        numero: 3,
        instrucao: "Fale a seguinte frase para a câmera:",
        detalhe: `“Eu abri aquela caixinha sobre ${title.toLowerCase()} e essa foi uma das perguntas que mais apareceu. A resposta mais honesta é esta: o que realmente faz diferença em ${niche} é clareza, constância e execução bem feita. Então, em vez de tentar resolver tudo de uma vez, olha primeiro para o ponto que mais trava seu resultado hoje.”`,
      },
      {
        numero: 4,
        instrucao: "Finalize convidando a audiência a continuar mandando perguntas.",
        detalhe:
          "Feche dizendo que você pode responder as próximas ainda hoje, mantendo a continuidade da sequência.",
      },
    ] satisfies DetailStep[];
  }

  const interactionText =
    styleId === "H04" || styleId === "H05"
      ? `Escreva na caixinha: “Qual é a sua maior dúvida sobre ${title.toLowerCase()}?”`
      : `Crie uma enquete com duas opções simples ligadas a ${title.toLowerCase()}.`;

  return [
    {
      numero: 1,
      instrucao: "Abra o Instagram e entre na câmera de histórias.",
      detalhe: "Use enquadramento vertical e deixe o ambiente limpo antes de gravar.",
    },
    {
      numero: 2,
      instrucao: "Grave um vídeo mostrando seu rosto, pelo menos dos ombros para cima.",
      detalhe:
        "Olhe diretamente para a câmera com naturalidade. Fundo neutro ou ambiente de trabalho sempre ajudam.",
    },
    {
      numero: 3,
      instrucao:
        styleId === "H04" || styleId === "H05"
          ? "Adicione a caixinha de perguntas na parte inferior do story."
          : "Adicione a enquete na parte inferior do story.",
      detalhe: interactionText,
    },
    {
      numero: 4,
      instrucao: "Fale a seguinte frase para a câmera:",
      detalhe: buildStorySpeech(title, niche, sanitizeText(body.tom_de_voz || ""), sanitizeText(body.objetivo_usuario || "")),
    },
    {
      numero: 5,
      instrucao: connectedMessage.existe
        ? "Avise que esse conteúdo terá continuidade no próximo story conectado."
        : "Feche convidando a audiência a responder agora.",
      detalhe: connectedMessage.existe
        ? connectedMessage.mensagem
        : "Diga que você vai acompanhar as respostas e usar isso para aprofundar o tema.",
    },
  ];
}

function buildReelsHook(title: string, niche: string, tone: string) {
  const normalizedTone = normalizeText(tone);

  if (normalizedTone.includes("formal")) {
    return `“Se você trabalha com ${niche}, precisa prestar atenção nisto sobre ${title.toLowerCase()}.”`;
  }

  if (normalizedTone.includes("tecnic")) {
    return `“Existe um detalhe em ${title.toLowerCase()} que quase ninguém corrige no ${niche}.”`;
  }

  return `“Se você quer melhorar ${title.toLowerCase()} no ${niche}, olha isso aqui.”`;
}

function buildReelsDevelopment(title: string, niche: string, goal: string) {
  const objective = getObjectiveAngle(goal);

  return [
    `• Explique por que ${title.toLowerCase()} costuma travar resultado quando a mensagem fica genérica.`,
    `• Mostre um exemplo real ou bastidor curto do seu dia a dia em ${niche}.`,
    `• Feche esse bloco dizendo como esse ajuste ajuda a ${objective}.`,
  ].join("\n");
}

function buildReelsSteps(body: DetailRequest) {
  const title = sanitizeText(body.titulo || "esse tema");
  const niche = sanitizeText(body.nicho || "o seu nicho");
  const tone = sanitizeText(body.tom_de_voz || "");

  return [
    {
      numero: 1,
      instrucao: "Abra a câmera e grave na vertical.",
      detalhe: "Use enquadramento fechado, boa luz frontal e mantenha o celular estável.",
    },
    {
      numero: 2,
      instrucao: "Grave o gancho nos primeiros 3 segundos.",
      detalhe: buildReelsHook(title, niche, tone),
    },
    {
      numero: 3,
      instrucao: "Desenvolva o conteúdo em cortes separados.",
      detalhe: buildReelsDevelopment(title, niche, sanitizeText(body.objetivo_usuario || "")),
    },
    {
      numero: 4,
      instrucao: "Grave o CTA final.",
      detalhe: `“Se isso fez sentido para você, salva este vídeo e me chama no direct para falar sobre ${niche}.”`,
    },
  ] satisfies DetailStep[];
}

function buildCarouselSlides(body: DetailRequest) {
  const providedSlides = Array.isArray(body.slides)
    ? body.slides
        .map((slide, index) => ({
          numero: typeof slide.numero === "number" ? slide.numero : index + 1,
          tipo: sanitizeText(slide.tipo || (index === 0 ? "capa" : "conteudo")),
          texto_principal: sanitizeText(slide.texto_principal || ""),
          texto_secundario: sanitizeText(slide.texto_secundario || ""),
        }))
        .filter((slide) => slide.texto_principal)
    : [];

  if (providedSlides.length > 0) {
    return providedSlides;
  }

  const title = sanitizeText(body.titulo || "esse tema");
  const niche = sanitizeText(body.nicho || "o seu nicho");

  return [
    {
      numero: 1,
      tipo: "capa",
      texto_principal: title,
      texto_secundario: "O ponto que mais faz diferença na prática",
    },
    {
      numero: 2,
      tipo: "conteudo",
      texto_principal: "Onde a maioria erra",
      texto_secundario: `No ${niche}, o erro mais comum é falar desse tema de forma genérica.`,
    },
    {
      numero: 3,
      tipo: "conteudo",
      texto_principal: "O que fazer diferente",
      texto_secundario: "Mostre contexto real, simplifique a mensagem e prove com um exemplo.",
    },
    {
      numero: 4,
      tipo: "cta",
      texto_principal: "Salve este carrossel",
      texto_secundario: "E use isso como referência no próximo conteúdo.",
    },
  ] satisfies CarouselSlide[];
}

function buildCarouselSteps(body: DetailRequest) {
  const slides = buildCarouselSlides(body);

  return [
    {
      numero: 1,
      instrucao: "Abra o Canva e crie um carrossel em formato vertical para feed.",
      detalhe: "Use 1080x1350 px para aproveitar melhor a tela do Instagram.",
    },
    {
      numero: 2,
      instrucao: "Monte a capa com um título forte e leitura imediata.",
      detalhe: `Capa sugerida: ${slides[0]?.texto_principal}. Subtítulo: ${slides[0]?.texto_secundario || "Passe para o lado"}.`,
    },
    {
      numero: 3,
      instrucao: "Desenvolva os slides de conteúdo com uma ideia por tela.",
      detalhe: slides
        .filter((slide) => slide.tipo !== "capa" && slide.tipo !== "cta")
        .map((slide) => `• Slide ${slide.numero}: ${slide.texto_principal} — ${slide.texto_secundario || ""}`)
        .join("\n"),
    },
    {
      numero: 4,
      instrucao: "Feche com um CTA simples e visualmente limpo.",
      detalhe: `No último slide, use: ${slides[slides.length - 1]?.texto_principal}. ${slides[slides.length - 1]?.texto_secundario || ""}`,
    },
  ] satisfies DetailStep[];
}

function buildFeedPhotoSteps(body: DetailRequest) {
  const title = sanitizeText(body.titulo || "esse tema");
  const niche = sanitizeText(body.nicho || "o seu nicho");
  const legenda = sanitizeText(body.legenda || "");

  return [
    {
      numero: 1,
      instrucao: "Escolha uma foto real que traduza esse tema com clareza.",
      detalhe:
        "Pode ser você, seu ambiente, seu produto ou um detalhe forte do seu processo.",
    },
    {
      numero: 2,
      instrucao: "Ajuste luz, enquadramento e contraste antes de publicar.",
      detalhe:
        "Prefira uma imagem limpa, com ponto focal evidente e sem excesso de elementos no fundo.",
    },
    {
      numero: 3,
      instrucao: "Escreva uma legenda curta, direta e alinhada ao objetivo do post.",
      detalhe:
        legenda ||
        `Comece conectando ${title.toLowerCase()} ao que o público sente no dia a dia e feche com um convite para salvar ou chamar no direct.`,
    },
    {
      numero: 4,
      instrucao: "Finalize a publicação com CTA claro.",
      detalhe: `Feche a legenda convidando a audiência a continuar a conversa sobre ${niche}.`,
    },
  ] satisfies DetailStep[];
}

function buildVisualGuide(body: DetailRequest, baseType: string): DetailResponse["guia_visual"] {
  const title = sanitizeText(body.titulo || "esse conteúdo");
  const visualSize =
    baseType === "HISTORY"
      ? "Crie um story vertical em 1080x1920 px."
      : baseType === "REELS"
        ? "Organize a capa e os takes em 1080x1920 px."
        : "Crie o layout em 1080x1350 px para feed.";

  const extraTool =
    baseType === "REELS" ? ["CapCut (para reels)"] : [];

  return {
    introducao: "O que criar para esse conteúdo:",
    passos_visuais: [
      {
        numero: 1,
        instrucao: "Abra o Canva ou Adobe Express.",
        detalhe: visualSize,
      },
      {
        numero: 2,
        instrucao: "Use a cor principal da sua identidade visual como base.",
        detalhe: "Combine com tipografia legível, contraste forte e bastante respiro entre os elementos.",
      },
      {
        numero: 3,
        instrucao:
          baseType === "REELS"
            ? "Escolha uma capa limpa e grave em ambiente coerente com o tema."
            : "Destaque o título principal com texto grande e leitura imediata.",
        detalhe:
          baseType === "REELS"
            ? `A capa precisa reforçar ${title.toLowerCase()} e o cenário deve parecer real, não montado demais.`
            : `Evite excesso de texto. O visual deve reforçar ${title.toLowerCase()} em poucos segundos.`,
      },
    ],
    ferramentas_sugeridas: ["Canva", "Adobe Express", ...extraTool],
    dicas_visuais: [
      {
        tipo: "dica",
        cor: "verde",
        texto:
          baseType === "HISTORY"
            ? "Designs minimalistas com fundo sólido e texto grande costumam performar melhor em Stories."
            : baseType === "REELS"
              ? "Capas simples com rosto, contraste forte e poucas palavras tendem a gerar mais clique no Reels."
              : "Carrosséis e posts com contraste forte e hierarquia clara seguram melhor a atenção no feed.",
      },
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DetailRequest;
    const styleId = sanitizeText(body.estilo_id || "").toUpperCase();
    const title = sanitizeText(body.titulo || "");
    const postId = sanitizeText(body.id_publicacao || "");

    if (!styleId || !title || !postId) {
      return new Response(
        JSON.stringify({
          error: "id_publicacao, estilo_id e titulo são obrigatórios.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const baseType = getBaseType(body.tipo || "", styleId);
    const connectedMessage = buildConnectedMessage(body, baseType, styleId);
    const introByType: Record<string, string> = {
      HISTORY: "Este conteúdo serve para abrir conversa e fazer o público reagir com menos atrito.",
      FEED_FOTO: "Este conteúdo serve para posicionar sua marca com clareza e reforçar percepção de valor.",
      FEED_CARROSSEL:
        "Este conteúdo serve para ensinar com clareza e aumentar a chance de salvamento.",
      REELS: "Este conteúdo serve para chamar atenção rápido e transformar alcance em interesse real.",
    };

    const roteiroPassos =
      baseType === "HISTORY"
        ? buildStorySteps(body, styleId, connectedMessage)
        : baseType === "REELS"
          ? buildReelsSteps(body)
          : baseType === "FEED_CARROSSEL"
            ? buildCarouselSteps(body)
            : buildFeedPhotoSteps(body);

    const response: DetailResponse = {
      titulo_exibido: title,
      tipo: baseType,
      roteiro: {
        introducao: introByType[baseType] || introByType.FEED_FOTO,
        passos: roteiroPassos,
        avisos: [
          {
            tipo: "aviso",
            cor: "vermelho",
            texto:
              baseType === "HISTORY"
                ? "Se ninguém responder à caixinha, você mesmo pode fazer a pergunta e responder. Isso gera conteúdo real — não há nada de errado nisso."
                : "Não tente colocar informação demais em uma única etapa. Clareza sempre converte melhor.",
          },
          {
            tipo: "dica",
            cor: "verde",
            texto:
              baseType === "REELS"
                ? "Reels com rosto, gancho forte e cortes curtos tendem a segurar mais retenção."
                : "Imagens e vídeos com rosto humano geram até 38% mais engajamento.",
          },
        ],
        conexao_proximo: connectedMessage,
      },
      guia_visual: buildVisualGuide(body, baseType),
      slides: baseType === "FEED_CARROSSEL" ? buildCarouselSlides(body) : null,
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Não foi possível gerar o detalhe do conteúdo agora.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
