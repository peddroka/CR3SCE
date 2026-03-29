export const maxDuration = 30;

interface TooltipRequest {
  estilo_id?: string;
  tipo_conteudo?: string;
  titulo_conteudo?: string;
  horario?: string;
  nicho?: string;
  objetivo_usuario?: string;
}

interface TooltipResponse {
  titulo: string;
  explicacao: string;
  insight: string;
  cta: string;
}

function normalizeText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function sanitizeText(value: string) {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value: string) {
  return sanitizeText(value).split(/\s+/).filter(Boolean).length;
}

function trimToWords(value: string, maxWords: number) {
  const words = sanitizeText(value).split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return sanitizeText(value);
  }

  return words.slice(0, maxWords).join(" ").trim();
}

function getTimeBucket(horario: string) {
  const [hourRaw] = (horario || "").split(":");
  const hour = Number(hourRaw);

  if (Number.isNaN(hour)) return "geral";
  if (hour < 12) return "manha";
  if (hour < 18) return "meio_do_dia";
  return "noite";
}

function mapLegacyTypeToStyleId(type: string) {
  const normalized = normalizeText(type);
  const upper = normalized.toUpperCase();

  if (/^[HFR]\d{2}$/.test(upper)) {
    return upper;
  }

  if (normalized.includes("history_caixinha")) return "H04";
  if (normalized.includes("history_enquete")) return "H06";
  if (normalized.includes("history_bastidores")) return "H03";
  if (normalized.includes("history_dica")) return "H08";
  if (normalized.includes("history_bomdiaboatarde")) return "H01";
  if (normalized.includes("feed_carrossel") || normalized.includes("carrossel")) {
    return "F02";
  }
  if (normalized.includes("feed_foto") || normalized.includes("post estatico")) {
    return "F05";
  }
  if (normalized.includes("reels_educativo")) return "R01";
  if (normalized.includes("reels_rapido") || normalized.includes("reels")) {
    return "R18";
  }

  return "F05";
}

function resolveStyleId(body: TooltipRequest) {
  const rawStyleId = sanitizeText(body.estilo_id || "").toUpperCase();

  if (/^[HFR]\d{2}$/.test(rawStyleId)) {
    return rawStyleId;
  }

  return mapLegacyTypeToStyleId(body.tipo_conteudo || "");
}

function getObjectiveAngle(objetivo: string) {
  const normalized = normalizeText(objetivo);

  if (
    normalized.includes("vender") ||
    normalized.includes("venda") ||
    normalized.includes("lead")
  ) {
    return {
      foco: "abrir conversa com intenção de compra",
      cta: "É daqui que a venda certa começa.",
    };
  }

  if (normalized.includes("engajar")) {
    return {
      foco: "aumentar resposta e conversa",
      cta: "Seu público tende a reagir aqui.",
    };
  }

  if (
    normalized.includes("crescer") ||
    normalized.includes("seguidor") ||
    normalized.includes("visualizacao")
  ) {
    return {
      foco: "ganhar alcance com direção",
      cta: "Isso puxa descoberta com qualidade.",
    };
  }

  if (normalized.includes("autoridade")) {
    return {
      foco: "virar referência no tema",
      cta: "É assim que autoridade se constrói.",
    };
  }

  return {
    foco: "fortalecer a presença do perfil",
    cta: "Seu perfil precisa desse movimento.",
  };
}

function buildTimeAwareInsight(
  timeBucket: string,
  fallback: string,
  options?: Partial<Record<"manha" | "meio_do_dia" | "noite", string>>,
) {
  if (timeBucket === "manha" && options?.manha) return options.manha;
  if (timeBucket === "meio_do_dia" && options?.meio_do_dia) return options.meio_do_dia;
  if (timeBucket === "noite" && options?.noite) return options.noite;
  return fallback;
}

function buildTooltipCopy(
  styleId: string,
  horario: string,
  nicho: string,
  objetivoUsuario: string,
): TooltipResponse {
  const niche = sanitizeText(nicho || "seu nicho");
  const objective = getObjectiveAngle(objetivoUsuario);
  const timeBucket = getTimeBucket(horario);
  let explicacao = "";
  let insight = "";
  let cta = objective.cta;

  switch (styleId) {
    case "H04":
    case "H05":
      explicacao = `Interação reduz atrito e revela a linguagem real do público. Para ${niche}, essa caixinha ajuda a ${objective.foco} com dúvidas que já existem na cabeça do cliente.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Quando a pergunta vem do seguidor, a resposta nasce mais relevante e persuasiva.",
        {
          meio_do_dia:
            "No meio do dia, caixinhas costumam performar melhor porque a resposta exige pouco esforço.",
        },
      );
      cta = "Esse é o começo da conversa certa.";
      break;
    case "H06":
    case "H07":
    case "H24":
      explicacao = `Enquete pede um toque e acelera resposta. Em ${niche}, ela aquece a audiência antes do conteúdo principal e ajuda a ${objective.foco}.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Quanto menor a fricção, maior a chance de reação rápida nos Stories.",
        {
          meio_do_dia:
            "Resposta de um toque costuma ganhar mais volume em janelas curtas do dia.",
        },
      );
      cta = "É aqui que o engajamento ganha ritmo.";
      break;
    case "H14":
      explicacao = `Continuidade aumenta retenção e confiança. Para ${niche}, responder a caixinha no mesmo dia mostra presença e ajuda a ${objective.foco} com mais credibilidade.`;
      insight =
        "Quando o seguidor percebe sequência, ele tende a assistir mais stories seguidos.";
      cta = "Mostre que você escuta de verdade.";
      break;
    case "H03":
    case "H09":
    case "H15":
    case "H16":
    case "H17":
    case "H19":
      explicacao = `Bastidor reduz distância e aumenta credibilidade. Em ${niche}, mostrar processo real ajuda a ${objective.foco} sem depender de promessa vazia.`;
      insight = "Prova visual costuma convencer melhor do que explicação abstrata.";
      cta = "Confiança nasce no detalhe real.";
      break;
    case "H01":
    case "H02":
    case "H13":
    case "H22":
    case "H23":
      explicacao = `Consistência simples mantém sua marca viva na memória do público. Para ${niche}, esse story sustenta lembrança e ajuda a ${objective.foco} sem parecer forçar venda.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Presença recorrente aumenta lembrança de marca com pouco atrito.",
        {
          manha: "Quem te vê cedo tende a lembrar de você ao longo do dia.",
          noite: "No fim do dia, a lembrança da marca ajuda na decisão posterior.",
        },
      );
      cta = "Seu público precisa te ver com frequência.";
      break;
    case "H08":
    case "H10":
    case "H11":
    case "H12":
    case "H18":
    case "H20":
    case "H21":
    case "H25":
      explicacao = `Conteúdo rápido entrega valor com baixa resistência. Para ${niche}, isso ajuda a ${objective.foco} com presença útil e fácil de consumir.`;
      insight = "Microvalor recorrente acelera autoridade e mantém o perfil relevante.";
      cta = "Valor simples também posiciona forte.";
      break;
    case "F01":
    case "F08":
    case "F09":
    case "F13":
      explicacao = `Carrossel que quebra objeção segura atenção e organiza a decisão. Em ${niche}, ele ajuda a ${objective.foco} porque transforma dúvida em clareza.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Salvamento alto costuma indicar conteúdo que continua trabalhando depois da postagem.",
        {
          noite:
            "No início da noite, carrossel forte tende a ganhar mais leitura e salvamento.",
        },
      );
      cta = "Esse é o tipo de post que volta pelo salvamento.";
      break;
    case "F02":
    case "F03":
    case "F04":
    case "F10":
    case "F11":
    case "F14":
      explicacao = `Conteúdo educativo aumenta tempo de leitura e percepção de valor. Para ${niche}, ele ajuda a ${objective.foco} porque ensina sem parecer aula cansativa.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Quando o conteúdo é fácil de salvar, o algoritmo tende a ler mais valor.",
        {
          noite: "À noite, conteúdo educativo costuma ganhar leitura mais profunda.",
        },
      );
      cta = "Clareza bem entregue vira autoridade.";
      break;
    case "F05":
    case "F06":
    case "F07":
    case "F12":
    case "F15":
      explicacao = `Feed estático forte organiza a imagem da marca em segundos. Em ${niche}, isso ajuda a ${objective.foco} antes mesmo do direct ou do clique.`;
      insight = "Perfil coerente reduz dúvida e melhora a primeira impressão.";
      cta = "Seu perfil precisa vender antes da conversa.";
      break;
    case "R01":
    case "R05":
    case "R07":
    case "R12":
    case "R13":
    case "R16":
    case "R17":
    case "R20":
      explicacao = `Vídeo útil mistura alcance com qualificação. Para ${niche}, esse Reels ajuda a ${objective.foco} enquanto mostra domínio real do assunto.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Reels com utilidade clara retêm melhor porque entregam valor cedo.",
        {
          noite: "No início da noite, vídeo útil costuma reter mais atenção.",
        },
      );
      cta = "É assim que alcance vira autoridade.";
      break;
    case "R02":
    case "R03":
    case "R06":
    case "R08":
    case "R11":
    case "R14":
    case "R18":
    case "R19":
      explicacao = `Reels rápido testa gancho e acelera descoberta. Em ${niche}, ele ajuda a ${objective.foco} com menos atrito e mais chance de compartilhamento.`;
      insight = buildTimeAwareInsight(
        timeBucket,
        "Os três primeiros segundos decidem se o alcance abre ou trava.",
        {
          noite: "Na noite certa, vídeo curto ganha mais chance de distribuição.",
        },
      );
      cta = "Seu próximo público pode sair daqui.";
      break;
    case "R09":
    case "R10":
    case "R15":
      explicacao = `Vídeo com emoção, prova ou opinião forte gera memória rápida. Para ${niche}, isso ajuda a ${objective.foco} porque chama atenção e posiciona.`;
      insight = "Conteúdo que provoca reação tende a ganhar mais comentário e retenção.";
      cta = "É hora de aparecer com intenção.";
      break;
    default:
      explicacao = `Conteúdo bem encaixado no momento certo encurta a distância com o público. Em ${niche}, isso ajuda a ${objective.foco} sem desperdiçar atenção.`;
      insight = "Formato certo com mensagem clara sempre melhora a leitura de valor.";
      cta = "Seu público está esperando consistência.";
      break;
  }

  const response: TooltipResponse = {
    titulo: "Por que esse conteúdo funciona?",
    explicacao: sanitizeText(explicacao),
    insight: sanitizeText(insight),
    cta: sanitizeText(cta),
  };

  let totalWords =
    wordCount(response.explicacao) +
    wordCount(response.insight) +
    wordCount(response.cta);

  if (totalWords > 55) {
    response.explicacao = trimToWords(response.explicacao, 24);
    response.insight = trimToWords(response.insight, 18);
    response.cta = trimToWords(response.cta, 7);
  }

  totalWords =
    wordCount(response.explicacao) +
    wordCount(response.insight) +
    wordCount(response.cta);

  while (totalWords > 55 && wordCount(response.explicacao) > 14) {
    response.explicacao = trimToWords(
      response.explicacao,
      wordCount(response.explicacao) - 1,
    );
    totalWords =
      wordCount(response.explicacao) +
      wordCount(response.insight) +
      wordCount(response.cta);
  }

  while (totalWords > 55 && wordCount(response.insight) > 8) {
    response.insight = trimToWords(
      response.insight,
      wordCount(response.insight) - 1,
    );
    totalWords =
      wordCount(response.explicacao) +
      wordCount(response.insight) +
      wordCount(response.cta);
  }

  while (totalWords > 55 && wordCount(response.cta) > 4) {
    response.cta = trimToWords(response.cta, wordCount(response.cta) - 1);
    totalWords =
      wordCount(response.explicacao) +
      wordCount(response.insight) +
      wordCount(response.cta);
  }

  return response;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TooltipRequest;
    const styleId = resolveStyleId(body);

    if (!styleId) {
      return new Response(
        JSON.stringify({ error: "estilo_id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const payload = buildTooltipCopy(
      styleId,
      sanitizeText(body.horario || ""),
      sanitizeText(body.nicho || ""),
      sanitizeText(body.objetivo_usuario || ""),
    );

    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Não foi possível gerar o insight agora.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
