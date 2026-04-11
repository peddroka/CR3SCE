import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 180;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const CONTENT_GENERATION_SYSTEM_PROMPT = [
  "Voce e o nucleo de inteligencia do CR3SCE, um gestor de midias sociais profissional para pequenos negocios e criadores de conteudo brasileiros.",
  "Sua missao e gerar estrategias de conteudo reais, criativas e que convertem. Nunca gere conteudo genérico, vazio ou com cara de template.",
  "Nunca use asteriscos.",
  "Nunca use aspas para destacar palavras.",
  "Use apenas numeracao simples para listas.",
  "Texto limpo, sem caracteres especiais de formatacao.",
  "Escreva sempre em portugu\u00EAs do Brasil com acentua\u00E7\u00E3o correta e completa. Nunca omita acentos. Exemplos: a\u00E7\u00E3o, tamb\u00E9m, cria\u00E7\u00E3o, est\u00E1, in\u00EDcio, informa\u00E7\u00E3o.",
  "Explique sempre de forma simples, visual e direta, como se estivesse guiando alguem que nunca trabalhou com redes sociais.",
  "Aplique isso em Stories, Carrossel, Post Estatico e Reels.",
  "Nos Stories, se o primeiro slot do dia acontecer antes das 10h, STORY 1 deve ser sempre um bom dia natural com o rosto do responsavel, sem caixinha ou enquete.",
  "Caixinha e enquete entram a partir do segundo Story do dia. Quando houver H04, H05, H06 ou H07, STORY 2 avisa que vai responder no proximo story. STORY 3 responde a primeira pergunta recebida de forma natural. A partir dali, use o rotulo DICAS - Continuacao.",
  "A pergunta da caixinha ou enquete deve ser curta, coloquial, facil de responder, adaptada ao nicho e nunca pode repetir literalmente o nome do tema do dia.",
  "Quando houver H14, ele nunca pode comecar dizendo que abriu uma caixinha. Comece direto respondendo, como se a conversa ja estivesse em andamento.",
  "A partir do STORY 3, nunca escreva roteiro fixo, porque o sistema nao sabe o que a audiencia vai perguntar. Apenas instrua o criador sobre como responder.",
  'No STORY 2, use um aviso curto como: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.',
  "No STORY 3, instrua assim: Responda a primeira pergunta recebida na caixinha. Seja direto, use exemplos reais.",
  "No STORY 4 em diante, instrua assim: Continue respondendo as perguntas recebidas, uma por uma. Seja natural, sem roteiro fixo. Se receber poucas perguntas, aprofunde mais cada resposta.",
  "Nunca use o nome do tema_base literalmente dentro da fala do responsavel. Transforme o tema em contexto real de conversa.",
  "Cada conteudo precisa servir ao objetivo declarado pelo usuario. Se nao servir, refaca antes de responder.",
  "Dentro do mesmo dia, cada postagem deve cumprir uma funcao diferente na jornada do seguidor: manha para ativacao, curiosidade ou conexao emocional; meio-dia para aprofundamento, resposta ou bastidor; tarde e noite para conversao, reflexao ou CTA forte.",
  "Nunca repita o mesmo formato no mesmo dia sem um motivo claro. Se houver enquete cedo, o proximo conteudo deve responder, aprofundar ou mostrar o resultado dessa enquete, e nao abrir outra igual.",
  "O tema do dia e ponto de partida, nao prisao. Use o gancho cultural ou emocional para falar do nicho e do objetivo do cliente.",
  "No Carrossel, use de 3 a 5 slides. O slide 1 deve ser capa com Passe para o lado no rodape. Os slides seguintes devem ser diretos e o ultimo slide precisa ter CTA claro.",
  "No Post Estatico, entregue legenda pronta para copiar e colar, entre 150 e 250 caracteres, com CTA no final e descricao da imagem ideal alinhada ao nicho.",
  "No Reel, o roteiro entra dentro de cada etapa e nao existe area de roteiro separada.",
  "O passo a passo do Reel deve conter: 1. Abra a camera e grave na vertical. 2. Nos 3 primeiros segundos, fale este gancho: [gancho aqui]. 3. Em seguida fale: [roteiro completo aqui]. 4. Feche dizendo: [chamada para acao aqui]. 5. Na edicao: cortes rapidos, legenda e musica popular no momento da gravacao.",
].join("\n");

type GrowthSpeed = "rapido" | "moderado" | "leve";
type EditorialSubtype =
  | "HISTORY_BOMDIABOATARDE"
  | "HISTORY_CAIXINHA"
  | "HISTORY_BASTIDORES"
  | "HISTORY_DICA"
  | "HISTORY_ENQUETE"
  | "FEED_FOTO"
  | "FEED_CARROSSEL"
  | "REELS_RAPIDO"
  | "REELS_EDUCATIVO";
type StyleFamily = "HISTORY" | "FEED" | "REELS";
type PostingWindow = "morning" | "lunch" | "evening";

interface StrategyRequestOverrides {
  nome?: string;
  nicho?: string;
  publico_alvo?: string;
  objetivo_principal?: string;
  tom_de_voz?: string;
  horarios_disponiveis?: string[];
  dias_ativos?: string[];
  inicio_mes?: string;
}

interface PlanningPreferences {
  availableTimes: string[];
  activeWeekdays: Set<number> | null;
  startDate: string | null;
}

interface BusinessProfile {
  id: string;
  business_name: string;
  niche: string;
  target_audience: string;
  main_goal: string;
  platforms: string;
  communication_style: string;
  growth_speed: GrowthSpeed;
  brand_description: string;
  responsible_name?: string | null;
  instagram_handle?: string | null;
  brand_colors?: string[] | null;
  unique_value?: string | null;
  competitors?: string | null;
}

type HolidayPriority = "primary" | "secondary";
type HolidayPhase = "anticipacao" | "dia" | "encerramento";

interface HolidayMoment {
  day_number: number;
  title: string;
  priority: HolidayPriority;
  phase: HolidayPhase;
  guidance: string;
}

interface PlannedPostSeed {
  id: string;
  slot_index: number;
  time: string;
  content_type: string;
  subtype: EditorialSubtype;
  style_id?: string;
  style_label?: string | null;
  style_family?: StyleFamily;
  connected_to_slot_index?: number | null;
  is_viral_candidate: boolean;
  platform_tip?: string | null;
}

interface PlannedDay {
  day_number: number;
  posts: PlannedPostSeed[];
  focus_theme: string;
  content_pillar: string;
  primary_format: string;
  primary_subtype: EditorialSubtype;
  posting_window: PostingWindow;
  story_interaction: "caixinha" | "enquete";
  holiday_title?: string | null;
  holiday_priority?: HolidayPriority | null;
  holiday_phase?: HolidayPhase | null;
  holiday_guidance?: string | null;
}

interface GeneratedPost {
  slot_index: number;
  horario?: string;
  tipo?: string;
  estilo_id?: string;
  titulo?: string;
  topic: string;
  roteiro_resumido?: string;
  conectado_com?: string | null;
  cta?: string;
  legenda?: string | null;
  slides?: Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }> | null;
  script: string;
  hashtags: string;
  visual_prompt: string;
  is_viral?: boolean;
  subtype?: EditorialSubtype;
  platform_tip?: string | null;
}

interface StrategyCalendarPost {
  id: string;
  slot_index: number;
  time: string;
  content_type: string;
  subtype?: EditorialSubtype;
  style_id?: string;
  style_label?: string | null;
  summary?: string;
  connected_to?: string | null;
  cta?: string;
  legenda?: string | null;
  slides?: Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }> | null;
  topic: string;
  script: string;
  hashtags: string;
  visual_prompt: string;
  is_viral: boolean;
  completed: boolean;
  platform_tip?: string | null;
}

interface StyleDefinition {
  id: string;
  label: string;
  family: StyleFamily;
  subtype: EditorialSubtype;
  description: string;
}

interface StrategyCalendarDay {
  day_number: number;
  posts: StrategyCalendarPost[];
}

interface DayWindow {
  startDay: number;
  endDay: number;
}

interface DayStrategyBlueprint {
  content_pillar: string;
  primary_format: "Stories" | "Carrossel" | "Reels" | "Post Estatico";
  primary_subtype: EditorialSubtype;
  posting_window: PostingWindow;
  story_interaction: "caixinha" | "enquete";
}

const DAY_STRATEGY_ROTATION: DayStrategyBlueprint[] = [
  {
    content_pillar: "Caixinha de perguntas",
    primary_format: "Stories",
    primary_subtype: "HISTORY_CAIXINHA",
    posting_window: "lunch",
    story_interaction: "caixinha",
  },
  {
    content_pillar: "Carrossel educativo",
    primary_format: "Carrossel",
    primary_subtype: "FEED_CARROSSEL",
    posting_window: "evening",
    story_interaction: "enquete",
  },
  {
    content_pillar: "Reels de dica rapida",
    primary_format: "Reels",
    primary_subtype: "REELS_RAPIDO",
    posting_window: "evening",
    story_interaction: "caixinha",
  },
  {
    content_pillar: "Bastidor real",
    primary_format: "Stories",
    primary_subtype: "HISTORY_BASTIDORES",
    posting_window: "morning",
    story_interaction: "enquete",
  },
  {
    content_pillar: "Dica pratica do nicho",
    primary_format: "Stories",
    primary_subtype: "HISTORY_DICA",
    posting_window: "lunch",
    story_interaction: "caixinha",
  },
  {
    content_pillar: "Prova social",
    primary_format: "Post Estatico",
    primary_subtype: "FEED_FOTO",
    posting_window: "evening",
    story_interaction: "enquete",
  },
  {
    content_pillar: "Erro comum",
    primary_format: "Reels",
    primary_subtype: "REELS_EDUCATIVO",
    posting_window: "evening",
    story_interaction: "caixinha",
  },
  {
    content_pillar: "Enquete estrategica",
    primary_format: "Stories",
    primary_subtype: "HISTORY_ENQUETE",
    posting_window: "lunch",
    story_interaction: "enquete",
  },
  {
    content_pillar: "Comparativo pratico",
    primary_format: "Carrossel",
    primary_subtype: "FEED_CARROSSEL",
    posting_window: "evening",
    story_interaction: "caixinha",
  },
  {
    content_pillar: "FAQ do nicho",
    primary_format: "Reels",
    primary_subtype: "REELS_EDUCATIVO",
    posting_window: "evening",
    story_interaction: "enquete",
  },
];

const HISTORY_STYLES: StyleDefinition[] = [
  { id: "H01", label: "Bom dia com provocacao", family: "HISTORY", subtype: "HISTORY_BOMDIABOATARDE", description: "Abertura da manha com bom dia natural, rosto do responsavel e contexto real do dia." },
  { id: "H02", label: "Boa tarde com enquete rapida", family: "HISTORY", subtype: "HISTORY_ENQUETE", description: "Abertura da tarde com enquete objetiva e resposta curta." },
  { id: "H03", label: "Bastidores do dia de trabalho", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Mostra rotina real, processo e movimento do negocio." },
  { id: "H04", label: "Caixinha de perguntas sobre o nicho", family: "HISTORY", subtype: "HISTORY_CAIXINHA", description: "Abre caixinha para duvidas do nicho e exige continuidade no mesmo dia." },
  { id: "H05", label: "Caixinha de perguntas sobre o cliente", family: "HISTORY", subtype: "HISTORY_CAIXINHA", description: "Abre caixinha focada na dor do cliente e exige continuidade no mesmo dia." },
  { id: "H06", label: "Enquete de preferencia", family: "HISTORY", subtype: "HISTORY_ENQUETE", description: "Compara duas opcoes do nicho para gerar resposta rapida." },
  { id: "H07", label: "Enquete mito ou verdade", family: "HISTORY", subtype: "HISTORY_ENQUETE", description: "Enquete curta para quebrar objecoes e gerar conversa." },
  { id: "H08", label: "Dica rapida do dia", family: "HISTORY", subtype: "HISTORY_DICA", description: "Entrega uma dica curta, pratica e facil de aplicar." },
  { id: "H09", label: "Antes e depois de cliente", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Compara situacao inicial e resultado final para prova social." },
  { id: "H10", label: "Aviso de novo conteudo no feed", family: "HISTORY", subtype: "HISTORY_DICA", description: "Leva o seguidor para o feed com um motivo claro." },
  { id: "H11", label: "Contagem regressiva de lancamento", family: "HISTORY", subtype: "HISTORY_DICA", description: "Cria expectativa para produto, vaga, evento ou novidade." },
  { id: "H12", label: "Reacao a tendencia do momento", family: "HISTORY", subtype: "HISTORY_DICA", description: "Aproveita assunto quente com comentario rapido e opinativo." },
  { id: "H13", label: "Pergunta reflexiva", family: "HISTORY", subtype: "HISTORY_DICA", description: "Story simples com pergunta forte para gerar identificacao." },
  { id: "H14", label: "Resposta da caixinha anterior", family: "HISTORY", subtype: "HISTORY_DICA", description: "Continuacao direta da caixinha do mesmo dia, respondendo como se a conversa ja estivesse em andamento." },
  { id: "H15", label: "Nos bastidores de um projeto", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Mostra projeto em andamento, tela, ambiente ou etapa real." },
  { id: "H16", label: "Errei, aprendi e conto pra voce", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Story de vulnerabilidade com aprendizado aplicavel." },
  { id: "H17", label: "O que eu faria diferente hoje", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Reflexao pratica sobre melhoria e maturidade profissional." },
  { id: "H18", label: "Trend adaptada ao nicho", family: "HISTORY", subtype: "HISTORY_DICA", description: "Adapta uma trend visual ou narrativa para o contexto do negocio." },
  { id: "H19", label: "Historia curta de cliente", family: "HISTORY", subtype: "HISTORY_BASTIDORES", description: "Conta um caso realista com comeco, conflito e licao." },
  { id: "H20", label: "Aviso de live ou evento", family: "HISTORY", subtype: "HISTORY_DICA", description: "Convite direto para live, encontro, turma ou evento." },
  { id: "H21", label: "Humor do nicho", family: "HISTORY", subtype: "HISTORY_DICA", description: "Piada leve ou cena reconhecivel por quem vive o nicho." },
  { id: "H22", label: "Frase motivacional do nicho", family: "HISTORY", subtype: "HISTORY_DICA", description: "Mensagem curta que reforca mentalidade e posicionamento." },
  { id: "H23", label: "Curiosidade sobre o mercado", family: "HISTORY", subtype: "HISTORY_DICA", description: "Insight curioso do mercado com aplicacao pratica." },
  { id: "H24", label: "Desafio para o seguidor", family: "HISTORY", subtype: "HISTORY_ENQUETE", description: "Convida a audiencia a participar de um desafio rapido." },
  { id: "H25", label: "Tutorial rapido em 3 frames", family: "HISTORY", subtype: "HISTORY_DICA", description: "Ensino curto e visual dividido em tres partes." },
];

const FEED_STYLES: StyleDefinition[] = [
  { id: "F01", label: "Carrossel comparativo", family: "FEED", subtype: "FEED_CARROSSEL", description: "Compara opcao A contra opcao B com criterio claro." },
  { id: "F02", label: "Carrossel lista", family: "FEED", subtype: "FEED_CARROSSEL", description: "Lista erros, sinais, passos ou pontos essenciais." },
  { id: "F03", label: "Carrossel passo a passo", family: "FEED", subtype: "FEED_CARROSSEL", description: "Ensina um processo em ordem simples e pratica." },
  { id: "F04", label: "Carrossel storytelling", family: "FEED", subtype: "FEED_CARROSSEL", description: "Conta uma historia com licao e desdobramento." },
  { id: "F05", label: "Foto com frase de impacto", family: "FEED", subtype: "FEED_FOTO", description: "Imagem estatica com frase forte e memoravel." },
  { id: "F06", label: "Foto de bastidores com legenda reflexiva", family: "FEED", subtype: "FEED_FOTO", description: "Mostra bastidor com legenda de contexto e aprendizado." },
  { id: "F07", label: "Foto de resultado de cliente", family: "FEED", subtype: "FEED_FOTO", description: "Prova social com resultado, bastidor ou transformacao." },
  { id: "F08", label: "Carrossel mito vs verdade", family: "FEED", subtype: "FEED_CARROSSEL", description: "Quebra objecoes comparando mitos e fatos." },
  { id: "F09", label: "Carrossel perguntas e respostas", family: "FEED", subtype: "FEED_CARROSSEL", description: "Organiza perguntas frequentes em formato facil de salvar." },
  { id: "F10", label: "Infografico simples", family: "FEED", subtype: "FEED_CARROSSEL", description: "Usa dado, numero ou fluxo visual para explicar o tema." },
  { id: "F11", label: "Carrossel de tendencias do mes", family: "FEED", subtype: "FEED_CARROSSEL", description: "Mostra mudancas e tendencias relevantes ao nicho." },
  { id: "F12", label: "Foto minimalista com dado estatistico", family: "FEED", subtype: "FEED_FOTO", description: "Post enxuto com dado forte e leitura rapida." },
  { id: "F13", label: "Carrossel o que ninguem te conta", family: "FEED", subtype: "FEED_CARROSSEL", description: "Revela bastidor, verdade desconfortavel ou detalhe escondido." },
  { id: "F14", label: "Carrossel de rotina", family: "FEED", subtype: "FEED_CARROSSEL", description: "Mostra rotina, processo e ordem de execucao do nicho." },
  { id: "F15", label: "Foto com depoimento de cliente", family: "FEED", subtype: "FEED_FOTO", description: "Traz fala de cliente com contexto e credibilidade." },
];

const REELS_STYLES: StyleDefinition[] = [
  { id: "R01", label: "Reels educativo com gancho", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Ensina algo relevante com gancho forte nos tres primeiros segundos." },
  { id: "R02", label: "Reels de transformacao", family: "REELS", subtype: "REELS_RAPIDO", description: "Mostra antes e depois ou contraste de resultado." },
  { id: "R03", label: "Reels de trend adaptada", family: "REELS", subtype: "REELS_RAPIDO", description: "Usa trend do momento com contexto do nicho." },
  { id: "R04", label: "Reels storytelling de caso real", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Conta caso real ou realista com licao clara." },
  { id: "R05", label: "Reels voce sabia que", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Comeca com fato curioso e entrega uma revelacao." },
  { id: "R06", label: "Reels de bastidores acelerado", family: "REELS", subtype: "REELS_RAPIDO", description: "Mostra processo em ritmo rapido e visual." },
  { id: "R07", label: "Reels resposta a pergunta frequente", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Responde uma duvida comum com clareza." },
  { id: "R08", label: "Reels com lista rapida", family: "REELS", subtype: "REELS_RAPIDO", description: "Entrega lista curta e direta em poucos segundos." },
  { id: "R09", label: "Reels humor do nicho", family: "REELS", subtype: "REELS_RAPIDO", description: "Usa humor leve e reconhecivel por quem vive o nicho." },
  { id: "R10", label: "Reels com depoimento de cliente", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Transforma prova social em video objetivo." },
  { id: "R11", label: "Reels de rotina do profissional", family: "REELS", subtype: "REELS_RAPIDO", description: "Mostra rotina, ritmo e bastidores do dia." },
  { id: "R12", label: "Reels o que aprendi em anos", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Condensa experiencia em licao pratica." },
  { id: "R13", label: "Reels de demonstracao de servico", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Demonstra produto, servico ou entrega em acao." },
  { id: "R14", label: "Reels comparativo rapido", family: "REELS", subtype: "REELS_RAPIDO", description: "Compara duas abordagens de forma dinamica." },
  { id: "R15", label: "Reels provocacao", family: "REELS", subtype: "REELS_RAPIDO", description: "Usa uma afirmacao forte para gerar comentarios." },
  { id: "R16", label: "Reels nos bastidores de um processo", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Mostra processo interno com explicacao acessivel." },
  { id: "R17", label: "Reels com dado surpreendente", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Abre com estatistica ou insight de mercado impactante." },
  { id: "R18", label: "Reels de dica em 15 segundos", family: "REELS", subtype: "REELS_RAPIDO", description: "Entrega dica unica, clara e muito rapida." },
  { id: "R19", label: "Reels POV do cliente", family: "REELS", subtype: "REELS_RAPIDO", description: "Encena ponto de vista do cliente para gerar identificacao." },
  { id: "R20", label: "Reels com tutorial express", family: "REELS", subtype: "REELS_EDUCATIVO", description: "Ensina algo util em formato compacto e aplicavel." },
];

const STYLE_BANK = [...HISTORY_STYLES, ...FEED_STYLES, ...REELS_STYLES];
const STYLE_BANK_BY_ID = new Map(STYLE_BANK.map((style) => [style.id, style]));

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function normalizeText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function shiftDate(date: Date, days: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function getEasterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
) {
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekday = firstDay.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number) {
  const lastDay = new Date(year, month, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  return lastDay.getDate() - offset;
}

function dateMatchesMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function getShortAudience(targetAudience: string) {
  const cleaned = targetAudience.trim();
  if (!cleaned) return "o seu publico ideal";
  return cleaned.split(/[,.]/)[0].slice(0, 80);
}

function getBrandPaletteDescription(colors?: string[] | null) {
  if (!colors?.length) return "black, dark graphite, lime accent";
  return colors.join(", ");
}

function getPostingWindowFromTime(time: string): PostingWindow {
  const [hourRaw] = time.split(":");
  const hour = Number(hourRaw);

  if (Number.isNaN(hour)) return "evening";
  if (hour < 12) return "morning";
  if (hour < 18) return "lunch";
  return "evening";
}

function isTimeInRange(time: string, startHour: number, endHour: number) {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw || "0");

  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;

  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= startHour * 60 && totalMinutes <= endHour * 60 + 59;
}

function normalizeWeekdayToken(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/-feira/g, "")
    .replace(/\s+/g, "")
    .slice(0, 3);
}

function parseActiveWeekdays(values: unknown): Set<number> | null {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const weekdayMap: Record<string, number> = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sab: 6,
  };

  const parsed = values
    .map((value) => normalizeWeekdayToken(String(value || "")))
    .map((token) => weekdayMap[token])
    .filter((value) => typeof value === "number");

  return parsed.length ? new Set(parsed) : null;
}

function sanitizeAvailableTimes(values: unknown) {
  if (!Array.isArray(values) || values.length === 0) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter((value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function buildPlanningPreferences(
  body: StrategyRequestOverrides,
  businessCreatedAt?: string | null,
): PlanningPreferences {
  return {
    availableTimes: sanitizeAvailableTimes(body.horarios_disponiveis),
    activeWeekdays: parseActiveWeekdays(body.dias_ativos),
    startDate:
      typeof body.inicio_mes === "string" && body.inicio_mes.trim()
        ? body.inicio_mes.trim()
        : businessCreatedAt || null,
  };
}

function getStyleBankPrompt() {
  return STYLE_BANK.map(
    (style) => `${style.id} - ${style.label}: ${style.description}`,
  ).join("\n");
}

function getStyleFamilyForContentType(contentType: string): StyleFamily {
  if (contentType === "Reels") return "REELS";
  if (contentType === "Stories") return "HISTORY";
  return "FEED";
}

function rotateIds(ids: string[], offset: number) {
  if (ids.length <= 1) return ids;

  const start = ((offset % ids.length) + ids.length) % ids.length;
  return [...ids.slice(start), ...ids.slice(0, start)];
}

function styleWasUsedRecently(
  styleId: string,
  dayNumber: number,
  styleHistory: Map<string, number>,
  minGap = 10,
) {
  const lastUsedDay = styleHistory.get(styleId);

  if (typeof lastUsedDay !== "number") {
    return false;
  }

  return dayNumber - lastUsedDay < minGap;
}

function getStyleMinGap(styleId: string) {
  if (styleId === "H04" || styleId === "H05" || styleId === "H14") {
    return 7;
  }

  return 10;
}

function pickStyleId(
  candidateIds: string[],
  dayNumber: number,
  slotIndex: number,
  styleHistory: Map<string, number>,
) {
  const rotatedIds = rotateIds(candidateIds, dayNumber + slotIndex);
  const available = rotatedIds.find(
    (styleId) =>
      !styleWasUsedRecently(
        styleId,
        dayNumber,
        styleHistory,
        getStyleMinGap(styleId),
      ),
  );

  return available || rotatedIds[0];
}

function getHistoryStyleCandidates(
  post: PlannedPostSeed,
  dayPlan: Omit<PlannedDay, "posts">,
  previousStyleId?: string | null,
  nextPost?: PlannedPostSeed,
) {
  const [hourRaw] = post.time.split(":");
  const hour = Number(hourRaw || "0");

  if (previousStyleId === "H04" || previousStyleId === "H05") {
    return ["H14"];
  }

  if (post.slot_index === 0) {
    if (hour < 10) {
      return ["H01"];
    }

    if (hour < 12) {
      return ["H01", "H03", "H08", "H13", "H19", "H22", "H23"];
    }

    if (hour < 17) {
      return ["H02", "H03", "H12", "H13", "H21", "H23"];
    }

    return ["H03", "H12", "H13", "H18", "H21", "H22", "H23"];
  }

  const canOpenQuestionBox =
    dayPlan.story_interaction === "caixinha" &&
    Boolean(nextPost) &&
    nextPost?.content_type === "Stories" &&
    post.slot_index > 0;

  if (canOpenQuestionBox) {
    return ["H04", "H05", "H03", "H08", "H13"];
  }

  if (dayPlan.primary_subtype === "HISTORY_BASTIDORES") {
    return ["H03", "H15", "H16", "H17", "H19", "H23"];
  }

  if (dayPlan.primary_subtype === "HISTORY_ENQUETE") {
    return ["H06", "H07", "H24", "H12", "H13"];
  }

  return [
    "H03",
    "H08",
    "H09",
    "H10",
    "H11",
    "H12",
    "H13",
    "H15",
    "H16",
    "H17",
    "H18",
    "H19",
    "H20",
    "H21",
    "H22",
    "H23",
    "H24",
    "H25",
  ];
}

function getFeedStyleCandidates(post: PlannedPostSeed, dayPlan: Omit<PlannedDay, "posts">) {
  if (post.content_type === "Carrossel") {
    if (dayPlan.content_pillar.toLowerCase().includes("comparativo")) {
      return ["F01", "F08", "F13", "F14", "F03", "F02"];
    }

    return ["F02", "F03", "F04", "F08", "F09", "F10", "F11", "F13", "F14", "F01"];
  }

  if (dayPlan.content_pillar.toLowerCase().includes("prova")) {
    return ["F07", "F15", "F06", "F12", "F05"];
  }

  return ["F05", "F06", "F07", "F12", "F15"];
}

function getReelsStyleCandidates(post: PlannedPostSeed) {
  if (post.is_viral_candidate) {
    return ["R03", "R09", "R15", "R17", "R19", "R02"];
  }

  if (post.subtype === "REELS_RAPIDO") {
    return ["R01", "R08", "R11", "R14", "R18", "R20", "R05"];
  }

  return ["R04", "R05", "R07", "R10", "R12", "R13", "R16", "R17", "R20", "R01"];
}

function assignStylesToDay(
  rawPosts: PlannedPostSeed[],
  dayPlan: Omit<PlannedDay, "posts">,
  dayNumber: number,
  styleHistory: Map<string, number>,
) {
  return rawPosts.reduce<PlannedPostSeed[]>((assignedPosts, post, index) => {
    const previousStyleId =
      index > 0 ? assignedPosts[index - 1]?.style_id || null : null;
    const nextPost = rawPosts[index + 1];
    const family = getStyleFamilyForContentType(post.content_type);
    let candidateIds =
      family === "HISTORY"
        ? getHistoryStyleCandidates(post, dayPlan, previousStyleId, nextPost)
        : family === "FEED"
          ? getFeedStyleCandidates(post, dayPlan)
          : getReelsStyleCandidates(post);

    if (
      family === "HISTORY" &&
      candidateIds.some((styleId) => styleId === "H04" || styleId === "H05") &&
      styleWasUsedRecently("H14", dayNumber, styleHistory, getStyleMinGap("H14"))
    ) {
      candidateIds = candidateIds.filter(
        (styleId) => styleId !== "H04" && styleId !== "H05",
      );
    }

    if (candidateIds.length === 0) {
      candidateIds =
        family === "HISTORY"
          ? ["H03", "H08", "H13"]
          : family === "FEED"
            ? ["F02", "F05"]
            : ["R01", "R08"];
    }

    const styleId = pickStyleId(candidateIds, dayNumber, post.slot_index, styleHistory);
    const style = STYLE_BANK_BY_ID.get(styleId);

    styleHistory.set(styleId, dayNumber);

    assignedPosts.push({
      ...post,
      subtype: style?.subtype || post.subtype,
      style_id: styleId,
      style_label: style?.label || null,
      style_family: family,
      connected_to_slot_index:
        styleId === "H14" && index > 0
          ? assignedPosts[index - 1].slot_index
          : null,
    });

    return assignedPosts;
  }, []);
}

function mapSubtypeToLegacyContentType(subtype: EditorialSubtype) {
  if (subtype.startsWith("HISTORY_")) return "Stories";
  if (subtype === "FEED_CARROSSEL") return "Carrossel";
  if (subtype === "FEED_FOTO") return "Post Estatico";
  return "Reels";
}

function getPlatformTip(subtype: EditorialSubtype, time: string) {
  if (
    (subtype === "FEED_CARROSSEL" ||
      subtype === "REELS_RAPIDO" ||
      subtype === "REELS_EDUCATIVO") &&
    !isTimeInRange(time, 18, 21)
  ) {
    return "Postar entre 18h e 21h pode aumentar seu alcance. Considere adicionar esse horario.";
  }

  return null;
}

function ensureGreetingSlotFirst(sequence: string[]) {
  if (sequence.length === 0 || sequence[0] === "Stories") {
    return sequence;
  }

  const storyIndex = sequence.findIndex((item) => item === "Stories");

  if (storyIndex === -1) {
    sequence[0] = "Stories";
    return sequence;
  }

  const clone = [...sequence];
  [clone[0], clone[storyIndex]] = [clone[storyIndex], clone[0]];
  return clone;
}

function resolveGreetingLabel(time: string) {
  if (isTimeInRange(time, 0, 11)) return "Bom dia";
  if (isTimeInRange(time, 12, 16)) return "Boa tarde";
  return "Boa noite";
}

function getEditorialSubtypeForSeed(
  dayPlan: Omit<PlannedDay, "posts">,
  contentType: string,
  slotIndex: number,
  totalSlots: number,
  time: string,
  isViralCandidate: boolean,
): EditorialSubtype {
  if (slotIndex === 0) {
    return "HISTORY_BOMDIABOATARDE";
  }

  if (contentType === "Stories") {
    if (
      dayPlan.primary_subtype.startsWith("HISTORY_") &&
      dayPlan.primary_subtype !== "HISTORY_BOMDIABOATARDE" &&
      slotIndex === 1
    ) {
      return dayPlan.primary_subtype;
    }

    if (isTimeInRange(time, 12, 15)) {
      return dayPlan.story_interaction === "caixinha"
        ? "HISTORY_CAIXINHA"
        : "HISTORY_ENQUETE";
    }

    if (slotIndex === totalSlots - 1) {
      return "HISTORY_BASTIDORES";
    }

    return "HISTORY_DICA";
  }

  if (contentType === "Carrossel") {
    return "FEED_CARROSSEL";
  }

  if (contentType === "Post Estatico") {
    return "FEED_FOTO";
  }

  if (isViralCandidate || dayPlan.primary_subtype === "REELS_RAPIDO") {
    return "REELS_RAPIDO";
  }

  return "REELS_EDUCATIVO";
}

function buildThemeBank(
  business: BusinessProfile,
  year: number,
) {
  const audience = getShortAudience(business.target_audience);
  const niche = business.niche;
  const currentYear = year;

  const genericThemes = [
    `Como escolher ${niche} sem cair em promessa vazia`,
    `Os erros mais comuns de quem procura ${niche}`,
    `O que quase ninguem avalia antes de contratar ${niche}`,
    `Checklist rapido para acertar na escolha de ${niche}`,
    `Como comparar opcoes de ${niche} sem se arrepender depois`,
    `O que diferencia um bom ${niche} de uma opcao comum`,
    `Duvida real de ${audience} sobre ${niche}`,
    `A pergunta que ${audience} deveria fazer antes de fechar ${niche}`,
    `Bastidor real: como funciona ${niche} por dentro`,
    `O erro de economia que sai caro em ${niche}`,
    `Sinais de que voce precisa rever sua estrategia de ${niche}`,
    `O que mudou em ${niche} em ${currentYear}`,
    `Mitos que confundem quem esta pesquisando ${niche}`,
    `A verdade sobre preco e resultado em ${niche}`,
    `Como gerar mais confianca antes de vender ${niche}`,
    `O detalhe que faz ${niche} parecer mais premium`,
    `Como deixar ${niche} mais facil de entender para quem chega agora`,
    `O que mais trava o crescimento de quem vende ${niche}`,
    `Como transformar duvidas sobre ${niche} em oportunidade de venda`,
    `As perguntas mais frequentes sobre ${niche}`,
    `Como apresentar melhor o valor de ${niche}`,
    `O que faz alguem confiar mais em ${niche}`,
    `Como mostrar prova real em ${niche}`,
    `Tendencias de ${niche} para ${currentYear}`,
    `Como simplificar a comunicacao de ${niche}`,
    `O que ${audience} mais quer evitar quando busca ${niche}`,
    `Como organizar uma oferta de ${niche} que faca sentido`,
    `Os sinais de maturidade de uma marca de ${niche}`,
    `Como usar conteudo para vender ${niche} com mais constancia`,
    `O que responder quando alguem questiona o valor de ${niche}`,
    `O antes e depois mental de quem entende ${niche} de verdade`,
    `O erro de posicionamento que enfraquece ${niche}`,
    `Como criar mais clareza na comunicacao de ${niche}`,
    `A decisao simples que melhora o resultado de ${niche}`,
    `Como construir autoridade real em ${niche}`,
    `O que observar no primeiro contato com ${niche}`,
  ];

  return uniqueStrings(genericThemes);
}

function buildHolidayMoments(
  business: BusinessProfile,
  year: number,
  month: number,
  daysInMonth: number,
) {
  const niche = normalizeText(business.niche).toLowerCase();
  const isFoodBusiness =
    /restaurante|bar|caf[eé]|padaria|confeitaria|hamburg|pizz|acai|sorvet|doceria|mercado|feira/.test(
      niche,
    );
  const isRetailBusiness =
    /loja|moda|roupa|vestuario|calcado|acessorio|e-commerce|ecommerce|presente|otica|joia|joalheria/.test(
      niche,
    );
  const isHealthBusiness =
    /clinica|odonto|odont|medic|fisi|psico|nutri|saude|estetica|dermato/.test(
      niche,
    );
  const isBeautyBusiness =
    /salao|barbear|beleza|maqui|esmal|cilios|sobrancelha|estetica/.test(niche);
  const isEcoRelevant =
    isFoodBusiness ||
    isRetailBusiness ||
    /arquitet|engenh|decor|moveis|turismo|hotel|pousada|pet|veterin/.test(
      niche,
    );

  const primaryMoments: HolidayMoment[] = [];
  const secondaryMoments: HolidayMoment[] = [];

  const addMoment = (
    date: Date,
    title: string,
    priority: HolidayPriority,
    phase: HolidayPhase,
    guidance: string,
  ) => {
    if (!dateMatchesMonth(date, year, month)) return;

    const dayNumber = date.getDate();
    if (dayNumber < 1 || dayNumber > daysInMonth) return;

    const moment: HolidayMoment = {
      day_number: dayNumber,
      title,
      priority,
      phase,
      guidance,
    };

    if (priority === "primary") {
      primaryMoments.push(moment);
      return;
    }

    secondaryMoments.push(moment);
  };

  const addPrimarySequence = (
    date: Date,
    title: string,
    anticipationGuidance: string,
    dayGuidance: string,
    followUpGuidance: string,
  ) => {
    addMoment(
      shiftDate(date, -4),
      title,
      "primary",
      "anticipacao",
      anticipationGuidance,
    );
    addMoment(date, title, "primary", "dia", dayGuidance);
    addMoment(
      shiftDate(date, 1),
      title,
      "primary",
      "encerramento",
      followUpGuidance,
    );
  };

  const easter = getEasterDate(year);
  const goodFriday = shiftDate(easter, -2);
  const carnivalTuesday = shiftDate(easter, -47);
  const carnivalSaturday = shiftDate(carnivalTuesday, -3);
  const corpusChristi = shiftDate(easter, 60);
  const mothersDay = new Date(year, 4, getNthWeekdayOfMonth(year, 5, 0, 2));
  const fathersDay = new Date(year, 7, getNthWeekdayOfMonth(year, 8, 0, 2));
  const blackFriday = new Date(year, 10, getLastWeekdayOfMonth(year, 11, 5));
  const valentinesDay = new Date(year, 5, 12);
  const christmas = new Date(year, 11, 25);
  const newYearsEve = new Date(year, 11, 31);

  addPrimarySequence(
    easter,
    "Pascoa",
    isFoodBusiness
      ? "Antecipe a data com apetite e clima de reuniao em familia, conectando cardapio, reserva ou encomenda ao momento."
      : "Antecipe a Pascoa com um gancho emocional de familia, cuidado e presente, conectando a data ao valor do negocio de forma organica.",
    isFoodBusiness
      ? "No dia da Pascoa, coloque o negocio como parte da experiencia da familia, com convite claro para pedido, reserva ou visita."
      : "No dia da Pascoa, traga conexao, carinho e um convite natural para conhecer, comprar ou agendar.",
    "No dia seguinte, feche o ciclo com gratidao, bastidor ou prova social do que a data movimentou no negocio.",
  );

  addPrimarySequence(
    mothersDay,
    "Dia das Maes",
    isBeautyBusiness || isRetailBusiness
      ? "Crie antecipacao com presente, autocuidado ou experiencia memoravel para maes e filhas, sempre conectado ao que a marca entrega."
      : "Crie antecipacao com emocao, carinho e uma ideia pratica de como o negocio pode participar desse momento especial.",
    "No proprio Dia das Maes, priorize emocao, homenagem real e um CTA suave para compra, reserva ou mensagem.",
    "Depois da data, agradeca quem comprou, visitou ou participou e mostre como foi esse movimento no negocio.",
  );

  addPrimarySequence(
    valentinesDay,
    "Dia dos Namorados",
    isFoodBusiness
      ? "Aqueça a audiencia falando de experiencia a dois, reserva, cardapio ou momento especial para a data."
      : "Aqueça a audiencia com desejo, conexao e preparacao para impressionar, sempre adaptando a data ao nicho da empresa.",
    "No dia, use um gancho emocional de relacionamento e leve o publico para agendar, comprar ou chamar no direct.",
    "No encerramento, agradeca o movimento da data, repostando bastidores, entregas ou clima que marcou o negocio.",
  );

  addPrimarySequence(
    blackFriday,
    "Black Friday",
    "Comece a antecipacao com urgencia inteligente, oferta real e expectativa. Nada de desconto vazio ou generico.",
    "No dia da Black Friday, seja direto, claro e orientado para conversao, com CTA forte para compra ou mensagem.",
    "No dia seguinte, use escassez final, agradecimento ou ultima chamada para capturar quem quase comprou.",
  );

  addPrimarySequence(
    christmas,
    "Natal",
    isRetailBusiness || isFoodBusiness
      ? "Entre alguns dias antes com presente, ceia, encomenda ou preparacao de fim de ano conectada ao negocio."
      : "Entre alguns dias antes com clima de presente, gratidao e conexao, encaixando o negocio com naturalidade na rotina de Natal.",
    "No Natal, priorize gratidao, familia e presenca da marca de forma humana, sem parecer promocional demais.",
    "No dia seguinte, feche com agradecimento, bastidor ou saldo afetivo do que a data representou para a empresa.",
  );

  if (month === 12) {
    addMoment(
      newYearsEve,
      "Reveillon",
      "secondary",
      "dia",
      "Feche o ano com gratidao, bastidores, equipe, aprendizados e um convite leve para o novo ciclo.",
    );
  }

  if (month === 2 && dateMatchesMonth(carnivalSaturday, year, month)) {
    addMoment(
      carnivalSaturday,
      "Carnaval",
      "secondary",
      "dia",
      "Use clima de Carnaval com energia, cor e leveza, mas sempre fazendo o nicho ser o protagonista do post.",
    );
  }

  if (month === 3) {
    addMoment(
      new Date(year, 2, 8),
      "Dia Internacional da Mulher",
      "secondary",
      "dia",
      isHealthBusiness || isBeautyBusiness
        ? "Traga homenagem real, autoestima, cuidado e um convite organico para avaliacao, atendimento ou presente."
        : "Traga reconhecimento, historia e valor para mulheres do seu publico, conectando o negocio a esse cuidado.",
    );
    addMoment(
      new Date(year, 2, 15),
      "Semana do Consumidor",
      "secondary",
      "dia",
      "Use a data para reforcar valor percebido, oferta honesta, condicao especial ou beneficio claro para quem compra.",
    );
    addMoment(
      new Date(year, 2, 20),
      "Inicio do Outono",
      "secondary",
      "dia",
      "Conecte a mudanca de estacao ao consumo, rotina ou cuidado relacionado ao seu nicho.",
    );
  }

  if (month === 4) {
    addMoment(
      new Date(year, 3, 1),
      "Dia da Mentira",
      "secondary",
      "dia",
      "Use humor leve e uma brincadeira inteligente ligada a erros, mitos ou promessas vazias do nicho.",
    );
    addMoment(
      goodFriday,
      "Sexta-Feira Santa",
      "secondary",
      "dia",
      "Mantenha um tom mais sobrio, respeitoso e humano. Se vender, venda com suavidade.",
    );
    addMoment(
      new Date(year, 3, 21),
      "Tiradentes",
      "secondary",
      "dia",
      "Use o feriado para humanizar a marca, mostrar bastidor da equipe, pausa consciente ou rotina real do negocio.",
    );
    if (isEcoRelevant) {
      addMoment(
        new Date(year, 3, 22),
        "Dia da Terra",
        "secondary",
        "dia",
        "Conecte sustentabilidade, materia-prima, descarte, durabilidade ou proposito a partir da realidade do negocio.",
      );
    }
  }

  if (month === 5) {
    addMoment(
      new Date(year, 4, 1),
      "Dia do Trabalho",
      "secondary",
      "dia",
      "Valorize a equipe, o bastidor e o trabalho bem feito por tras da marca. Humanizacao vem antes da venda.",
    );
  }

  if (month === 6) {
    addMoment(
      new Date(year, 5, 5),
      "Dia Mundial do Meio Ambiente",
      "secondary",
      "dia",
      "Mostre atitudes sustentaveis ou escolhas conscientes que facam sentido para a rotina da empresa.",
    );
    addMoment(
      corpusChristi,
      "Corpus Christi",
      "secondary",
      "dia",
      "Use o feriado para ajustar horario, humanizar a equipe ou sugerir uma rotina mais leve conectada ao negocio.",
    );
    addMoment(
      new Date(year, 5, 24),
      "Festas Juninas",
      "secondary",
      "dia",
      "Aproveite o clima junino com repertorio brasileiro, humor e adaptacao real ao nicho, sem perder a cara da marca.",
    );
    addMoment(
      new Date(year, 5, 29),
      "Sao Pedro",
      "secondary",
      "dia",
      "Feche o ciclo junino com agradecimento, bastidor ou oferta final adaptada ao clima da data.",
    );
  }

  if (month === 7) {
    addMoment(
      new Date(year, 6, 15),
      "Ferias Escolares",
      "secondary",
      "dia",
      "Conecte o negocio a familia, lazer, praticidade ou rotina das ferias, de um jeito especifico para seu publico.",
    );
  }

  if (month === 8) {
    addPrimarySequence(
      fathersDay,
      "Dia dos Pais",
      isRetailBusiness || isFoodBusiness
        ? "Antecipe com presente, experiencia ou programa especial para pais e filhos."
        : "Antecipe com memoria, homenagem e um jeito real de o negocio participar da data.",
      "No dia, use emocao, presenca e um CTA leve para compra, reserva ou conversa.",
      "Depois da data, agradeca o movimento e mostre bastidores, clientes ou equipe celebrando.",
    );
  }

  if (month === 9) {
    addMoment(
      new Date(year, 8, 7),
      "Independencia do Brasil",
      "secondary",
      "dia",
      "Use o feriado para humanizar a marca, mostrar orgulho do negocio local e reforcar identidade brasileira sem soar forcado.",
    );
    addMoment(
      new Date(year, 8, 15),
      "Dia do Cliente",
      "secondary",
      "dia",
      "Coloque o cliente no centro com agradecimento, beneficio, historia real ou condicao especial.",
    );
    addMoment(
      new Date(year, 8, 21),
      "Dia da Arvore",
      "secondary",
      "dia",
      "Se fizer sentido para o nicho, conecte natureza, materia-prima, cuidado ou sustentabilidade de forma concreta.",
    );
    addMoment(
      new Date(year, 8, 22),
      "Inicio da Primavera",
      "secondary",
      "dia",
      "Aproveite a virada de estacao para renovar repertorio, vitrine, servico ou linguagem visual do negocio.",
    );
  }

  if (month === 10) {
    addMoment(
      new Date(year, 9, 12),
      "Dia das Criancas",
      "secondary",
      "dia",
      "Se o nicho tocar familia, presente, passeio ou experiencia, conecte a data a algo divertido e util.",
    );
    addMoment(
      new Date(year, 9, 31),
      "Halloween",
      "secondary",
      "dia",
      "Use humor, fantasia ou suspense de forma leve e adaptada ao nicho. Tendencia sim, mas com cara de marca real.",
    );
  }

  if (month === 11) {
    addMoment(
      new Date(year, 10, 2),
      "Finados",
      "secondary",
      "dia",
      "Mantenha um tom respeitoso e sensivel. Evite promocao agressiva.",
    );
    addMoment(
      new Date(year, 10, 15),
      "Proclamacao da Republica",
      "secondary",
      "dia",
      "Use o feriado para humanizar a marca, equipe e rotina de forma leve.",
    );
    addMoment(
      new Date(year, 10, 20),
      "Dia da Consciencia Negra",
      "secondary",
      "dia",
      "Aborde a data com respeito, repertorio e responsabilidade. Priorize representatividade, historia e contribuicao real.",
    );
  }

  if (month === 1) {
    addMoment(
      new Date(year, 0, 1),
      "Ano Novo",
      "secondary",
      "dia",
      "Comece o ano com gratidao, recomeço, metas e um convite natural para o cliente fazer parte desse novo ciclo.",
    );
  }

  if (month === 2) {
    addMoment(
      new Date(year, 1, 14),
      "Dia de Sao Valentim",
      "secondary",
      "dia",
      "Use o clima de relacionamento como gancho de engajamento, sem confundir com o Dia dos Namorados brasileiro.",
    );
  }

  if (month === 5 && isRetailBusiness) {
    addMoment(
      new Date(year, 4, 15),
      "Dia do Comerciante",
      "secondary",
      "dia",
      "Valorize o pequeno negocio, atendimento e rotina de quem vive o comercio na pratica.",
    );
  }

  if (month === 1 && isFoodBusiness) {
    addMoment(
      new Date(year, 0, getLastWeekdayOfMonth(year, 1, 6)),
      "Dia do Feirante",
      "secondary",
      "dia",
      "Conecte frescor, fornecedores, ingredientes e bastidores do abastecimento ao valor da marca.",
    );
  }

  const deduped = new Map<number, HolidayMoment>();
  [...primaryMoments, ...secondaryMoments]
    .sort((a, b) => a.day_number - b.day_number)
    .forEach((moment) => {
      const current = deduped.get(moment.day_number);
      if (!current || current.priority === "secondary") {
        deduped.set(moment.day_number, moment);
      }
    });

  return Array.from(deduped.values()).sort((a, b) => a.day_number - b.day_number);
}

function buildDayStrategies(
  activeDays: number[],
  business: BusinessProfile,
  year: number,
  holidayMoments: HolidayMoment[],
) {
  const themeBank = buildThemeBank(business, year);
  const holidayMap = new Map(
    holidayMoments.map((moment) => [moment.day_number, moment]),
  );
  const plannedDays: Array<Omit<PlannedDay, "posts">> = [];
  const recentThemes: string[] = [];
  const recentPrimarySubtypes: EditorialSubtype[] = [];

  activeDays.forEach((dayNumber, index) => {
    const themeCandidate =
      themeBank.find(
        (theme) =>
          !recentThemes.includes(normalizeText(theme).toLowerCase()),
      ) || themeBank[(index + dayNumber) % themeBank.length] || themeBank[0];

    const strategyCandidate =
      DAY_STRATEGY_ROTATION.find(
        (item) =>
          !recentPrimarySubtypes.includes(item.primary_subtype) &&
          plannedDays[plannedDays.length - 1]?.primary_format !== item.primary_format,
      ) ||
      DAY_STRATEGY_ROTATION.find(
        (item) =>
          plannedDays[plannedDays.length - 1]?.primary_format !== item.primary_format,
      ) ||
      DAY_STRATEGY_ROTATION[(index + dayNumber) % DAY_STRATEGY_ROTATION.length];
    const holidayMoment = holidayMap.get(dayNumber);

    plannedDays.push({
      day_number: dayNumber,
      focus_theme:
        holidayMoment?.phase === "anticipacao"
          ? `${holidayMoment.title} chegando: como conectar a data ao seu nicho sem soar genérico`
          : holidayMoment?.phase === "encerramento"
            ? `${holidayMoment.title}: o que ficou da data e como aproveitar esse movimento`
            : holidayMoment
              ? `${holidayMoment.title}: o negocio como protagonista da conversa`
              : themeCandidate,
      content_pillar:
        holidayMoment?.priority === "primary"
          ? "Campanha sazonal conectada ao negocio"
          : holidayMoment
            ? "Gancho de data comemorativa com contexto real"
            : strategyCandidate.content_pillar,
      primary_format:
        holidayMoment?.priority === "primary" ? "Reels" : strategyCandidate.primary_format,
      primary_subtype:
        holidayMoment?.priority === "primary"
          ? "REELS_RAPIDO"
          : strategyCandidate.primary_subtype,
      posting_window:
        holidayMoment?.priority === "primary" ? "evening" : strategyCandidate.posting_window,
      story_interaction: holidayMoment ? "caixinha" : strategyCandidate.story_interaction,
      holiday_title: holidayMoment?.title || null,
      holiday_priority: holidayMoment?.priority || null,
      holiday_phase: holidayMoment?.phase || null,
      holiday_guidance: holidayMoment?.guidance || null,
    });

    recentThemes.push(normalizeText(themeCandidate).toLowerCase());
    recentPrimarySubtypes.push(strategyCandidate.primary_subtype);

    if (recentThemes.length > 10) {
      recentThemes.shift();
    }

    if (recentPrimarySubtypes.length > 7) {
      recentPrimarySubtypes.shift();
    }
  });

  return plannedDays;
}

function ensureDayStrategyVariety(
  dayStrategies: Array<Omit<PlannedDay, "posts">>,
  business: BusinessProfile,
  year: number,
) {
  const themeBank = buildThemeBank(business, year);
  const adjustedStrategies: Array<Omit<PlannedDay, "posts">> = [];

  dayStrategies.forEach((dayStrategy, index) => {
    if (index === 0) {
      adjustedStrategies.push(dayStrategy);
      return;
    }

    const previousDay = adjustedStrategies[adjustedStrategies.length - 1];
    let nextDay = { ...dayStrategy };

    if (nextDay.holiday_title) {
      adjustedStrategies.push(nextDay);
      return;
    }

    if (previousDay.holiday_title) {
      adjustedStrategies.push(nextDay);
      return;
    }

    if (normalizeText(nextDay.focus_theme) === normalizeText(previousDay.focus_theme)) {
      const replacementTheme =
        themeBank.find(
          (theme) => normalizeText(theme) !== normalizeText(previousDay.focus_theme),
        ) || nextDay.focus_theme;

      nextDay = {
        ...nextDay,
        focus_theme: replacementTheme,
      };
    }

    if (nextDay.primary_format === previousDay.primary_format) {
      const replacementBlueprint =
        DAY_STRATEGY_ROTATION.find(
          (item) => item.primary_format !== previousDay.primary_format,
        ) || DAY_STRATEGY_ROTATION[0];

      nextDay = {
        ...nextDay,
        content_pillar: replacementBlueprint.content_pillar,
        primary_format: replacementBlueprint.primary_format,
        primary_subtype: replacementBlueprint.primary_subtype,
        posting_window: replacementBlueprint.posting_window,
        story_interaction: replacementBlueprint.story_interaction,
      };
    }

    adjustedStrategies.push(nextDay);
  });

  return adjustedStrategies;
}

function getGoalLabel(goal: string) {
  const labels: Record<string, string> = {
    visualizacao: "aumentar visualizacao",
    identidade: "construir identidade com publico qualificado",
    vendas: "gerar mais vendas",
    seguidores: "ganhar seguidores qualificados",
    engajamento: "aumentar o engajamento",
    autoridade: "construir autoridade",
    leads: "gerar leads",
  };

  return labels[goal] || goal || "crescer nas redes sociais";
}

function getGoalStrategyGuidance(goal: string) {
  if (goal === "visualizacao") {
    return "Priorize alcance, descoberta, ganchos fortes, curiosidade, ritmo rapido, temas amplos do nicho e potencial de compartilhamento. Aceite conteudos menos profundos quando isso aumentar a descoberta do perfil.";
  }

  if (goal === "identidade") {
    return "Priorize posicionamento, autoridade, prova social, objecoes reais, diferenciacao do negocio, conexao com o nicho e conteudos feitos para atrair pessoas com intencao real de compra.";
  }

  return "Equilibre alcance com construcao de autoridade para o negocio.";
}

function getCommunicationStyleGuidance(style: string) {
  if (style === "humoristico") {
    return "O tom precisa ser claramente humoristico, leve e espontaneo. Use comparacoes, ironia leve e cenas engraçadas sem perder a credibilidade do negocio.";
  }

  if (style === "educativo") {
    return "O tom precisa ser educativo e didatico. Explique o tema com clareza, exemplos prontos e linguagem de especialista acessivel.";
  }

  if (style === "casual") {
    return "O tom precisa soar humano, natural e proximo, como uma conversa direta com o cliente.";
  }

  return `Mantenha o tom ${style} de forma consistente em todos os conteudos.`;
}

function getCommunicationStyleGuidanceV2(style: string) {
  if (style === "humoristico") {
    return "O tom precisa ser claramente humorístico, leve e espontâneo. Use comparações, ironia leve e cenas engraçadas sem perder a credibilidade do negócio.";
  }

  if (style === "educativo") {
    return "O tom precisa ser educativo e didático. Explique o tema com clareza, exemplos prontos e linguagem de especialista acessível.";
  }

  if (style === "casual") {
    return "O tom precisa soar humano, natural e próximo, como uma conversa direta com o cliente.";
  }

  return `Mantenha o tom ${style} de forma consistente em todos os conteúdos.`;
}

function getPostDays(
  growthSpeed: GrowthSpeed,
  year: number,
  month: number,
  daysInMonth: number,
  activeWeekdays?: Set<number> | null,
) {
  const days: number[] = [];

  if (activeWeekdays?.size) {
    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekDay = new Date(year, month - 1, day).getDay();
      if (activeWeekdays.has(weekDay)) {
        days.push(day);
      }
    }
    return days;
  }

  if (growthSpeed === "rapido" || growthSpeed === "moderado") {
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }
    return days;
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekDay = new Date(year, month - 1, day).getDay();
    if ([1, 3, 6].includes(weekDay)) {
      days.push(day);
    }
  }

  return days;
}

function getInitialCycleWindow(
  businessCreatedAt: string | null | undefined,
  year: number,
  month: number,
  daysInMonth: number,
): DayWindow | null {
  if (!businessCreatedAt) return null;

  const createdAt = new Date(businessCreatedAt);
  if (Number.isNaN(createdAt.getTime())) return null;

  const createdYear = createdAt.getFullYear();
  const createdMonth = createdAt.getMonth() + 1;
  const createdDay = createdAt.getDate();

  if (year === createdYear && month === createdMonth) {
    return {
      startDay: createdDay,
      endDay: daysInMonth,
    };
  }

  if (createdDay <= 1) {
    return null;
  }

  const nextMonthDate = new Date(createdYear, createdMonth, 1);
  const nextMonth = nextMonthDate.getMonth() + 1;
  const nextYear = nextMonthDate.getFullYear();

  if (year === nextYear && month === nextMonth) {
    return {
      startDay: 1,
      endDay: Math.min(createdDay, daysInMonth),
    };
  }

  return null;
}

function getPostCountForDay(
  dayNumber: number,
  growthSpeed: GrowthSpeed,
  date: Date,
  availableTimes?: string[],
) {
  if (availableTimes?.length) {
    return availableTimes.length;
  }

  if (growthSpeed === "rapido") {
    return 8;
  }

  if (growthSpeed === "moderado") {
    return [2, 4, 6].includes(date.getDay()) ? 5 : 4;
  }

  return 3;
}

function getContentTypeForSlot(
  dayNumber: number,
  totalSlots: number,
  slotIndex: number,
  date: Date,
  growthSpeed: GrowthSpeed,
) {
  const feedType = dayNumber % 2 === 0 ? "Carrossel" : "Post Estatico";

  if (growthSpeed === "rapido") {
    if (slotIndex === 0) return "Reels";
    if (slotIndex >= 1 && slotIndex <= 6) return "Stories";
    if (slotIndex === 7) return feedType;
    return feedType;
  }

  if (growthSpeed === "moderado") {
    const hasReels = [2, 4, 6].includes(date.getDay());

    if (hasReels) {
      if (slotIndex === 0) return "Reels";
      if (slotIndex >= 1 && slotIndex <= 3) return "Stories";
      return feedType;
    }

    if (slotIndex <= 2) return "Stories";
    return feedType;
  }

  if (slotIndex === 0) return "Reels";
  if (slotIndex < totalSlots - 1) return "Stories";
  return feedType;
}

function getStrategicTime(
  contentType: string,
  slotIndex: number,
  dayNumber: number,
  growthSpeed: GrowthSpeed,
  date: Date,
) {
  if (contentType === "Reels") return dayNumber % 2 === 0 ? "19:30" : "18:30";
  if (contentType === "Carrossel") return "10:00";
  if (contentType === "Post Estatico") return "15:00";
  if (contentType === "Live") return "20:00";

  if (growthSpeed === "rapido") {
    const rapidStoryTimes = [
      "08:00",
      "09:30",
      "11:30",
      "13:30",
      "16:00",
      "19:00",
    ];
    return rapidStoryTimes[Math.max(0, slotIndex - 1)] || "20:30";
  }

  if (growthSpeed === "moderado") {
    const hasReels = [2, 4, 6].includes(date.getDay());
    const moderateStoryTimes = ["08:00", "12:30", "19:30"];
    const storyIndex = hasReels ? slotIndex - 1 : slotIndex;
    return moderateStoryTimes[Math.max(0, storyIndex)] || "20:30";
  }

  const fallbackStoryTimes = ["08:00", "12:15", "19:00"];
  return fallbackStoryTimes[Math.min(slotIndex, fallbackStoryTimes.length - 1)];
}

function getContentSequenceForDay(
  growthSpeed: GrowthSpeed,
  totalSlots: number,
  dayNumber: number,
  dayPlan: Omit<PlannedDay, "posts">,
) {
  const defaultFeedType = dayNumber % 2 === 0 ? "Carrossel" : "Post Estatico";
  const secondaryFeedType =
    defaultFeedType === "Carrossel" ? "Post Estatico" : "Carrossel";

  if (totalSlots <= 1) {
    return ["Stories"];
  }

  if (totalSlots === 2) {
    return ["Stories", dayPlan.primary_format === "Stories" ? defaultFeedType : dayPlan.primary_format];
  }

  if (totalSlots === 3) {
    const thirdType =
      dayPlan.primary_format === "Reels"
        ? defaultFeedType
        : dayPlan.primary_format === "Stories"
          ? "Reels"
          : "Stories";

    return ensureGreetingSlotFirst(["Stories", dayPlan.primary_format, thirdType]);
  }

  if (growthSpeed === "rapido") {
    const sequenceByFormat: Record<string, string[]> = {
      Stories: [
        "Stories",
        "Stories",
        "Stories",
        "Reels",
        "Stories",
        "Stories",
        defaultFeedType,
        secondaryFeedType,
      ],
      Carrossel: [
        "Stories",
        "Stories",
        "Carrossel",
        "Stories",
        "Reels",
        "Stories",
        "Stories",
        secondaryFeedType,
        defaultFeedType,
      ],
      Reels: [
        "Stories",
        "Stories",
        "Reels",
        "Stories",
        "Stories",
        defaultFeedType,
        secondaryFeedType,
        "Stories",
      ],
      "Post Estatico": [
        "Stories",
        "Stories",
        "Post Estatico",
        "Stories",
        "Stories",
        "Reels",
        secondaryFeedType,
        "Stories",
      ],
    };

    return ensureGreetingSlotFirst(
      [...(sequenceByFormat[dayPlan.primary_format] || sequenceByFormat.Stories)].slice(
        0,
        totalSlots,
      ),
    );
  }

  if (growthSpeed === "moderado") {
    const sequenceByFormat: Record<string, string[]> = {
      Stories: ["Stories", "Stories", "Stories", defaultFeedType, "Reels"],
      Carrossel: ["Stories", "Stories", "Carrossel", "Reels", "Stories"],
      Reels: ["Stories", "Stories", "Reels", defaultFeedType, "Stories"],
      "Post Estatico": [
        "Stories",
        "Stories",
        "Post Estatico",
        "Reels",
        "Stories",
      ],
    };

    return ensureGreetingSlotFirst(
      (sequenceByFormat[dayPlan.primary_format] || sequenceByFormat.Stories).slice(
        0,
        totalSlots,
      ),
    );
  }

  const lightSequenceByFormat: Record<string, string[]> = {
    Stories: ["Stories", "Stories", defaultFeedType],
    Carrossel: ["Carrossel", "Stories", "Reels"],
    Reels: ["Reels", "Stories", defaultFeedType],
    "Post Estatico": ["Post Estatico", "Stories", "Reels"],
  };

  return ensureGreetingSlotFirst(
    (lightSequenceByFormat[dayPlan.primary_format] || lightSequenceByFormat.Stories).slice(
      0,
      totalSlots,
    ),
  );
}

function getVariedStrategicTime(
  contentType: string,
  slotIndex: number,
  dayNumber: number,
  dayPlan: Omit<PlannedDay, "posts">,
  availableTimes?: string[],
) {
  if (availableTimes?.length) {
    return availableTimes[Math.min(slotIndex, availableTimes.length - 1)];
  }

  const storyPools: Record<
    PostingWindow,
    string[]
  > = {
    morning: ["08:10", "09:25", "11:45", "13:05", "17:40", "19:15"],
    lunch: ["08:45", "12:05", "13:20", "16:10", "18:30", "20:05"],
    evening: ["09:10", "11:55", "15:20", "17:50", "19:05", "20:25"],
  };

  const formatPools: Record<
    string,
    Record<PostingWindow, string[]>
  > = {
    Reels: {
      morning: ["09:20", "10:50"],
      lunch: ["12:20", "13:35"],
      evening: ["18:10", "19:25"],
    },
    Carrossel: {
      morning: ["09:40", "10:30"],
      lunch: ["12:10", "13:00"],
      evening: ["18:45", "19:40"],
    },
    "Post Estatico": {
      morning: ["10:15", "11:05"],
      lunch: ["12:45", "13:25"],
      evening: ["18:55", "19:50"],
    },
  };

  if (contentType === "Stories") {
    const pool = storyPools[dayPlan.posting_window];
    return pool[(dayNumber + slotIndex) % pool.length];
  }

  const pool =
    formatPools[contentType]?.[dayPlan.posting_window] ||
    formatPools[contentType]?.evening ||
    ["18:30"];

  return pool[(dayNumber + slotIndex) % pool.length];
}

function getCalendarWeekIndex(year: number, month: number, dayNumber: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  return Math.floor((firstDay + dayNumber - 1) / 7);
}

function buildPlanForMonth(
  business: BusinessProfile,
  year: number,
  month: number,
  daysInMonth: number,
  dayWindow?: DayWindow | null,
  planningPreferences?: PlanningPreferences,
) {
  const holidayMoments = buildHolidayMoments(business, year, month, daysInMonth);
  const baseActiveDays = getPostDays(
    business.growth_speed,
    year,
    month,
    daysInMonth,
    planningPreferences?.activeWeekdays,
  ).filter((day) => {
    if (!dayWindow) return true;
    return day >= dayWindow.startDay && day <= dayWindow.endDay;
  });
  const activeDays = Array.from(
    new Set([
      ...baseActiveDays,
      ...holidayMoments
        .map((moment) => moment.day_number)
        .filter((day) => {
          if (!dayWindow) return true;
          return day >= dayWindow.startDay && day <= dayWindow.endDay;
        }),
    ]),
  ).sort((a, b) => a - b);
  const dayStrategies = ensureDayStrategyVariety(
    buildDayStrategies(activeDays, business, year, holidayMoments),
    business,
    year,
  );
  const dayStrategiesMap = new Map(
    dayStrategies.map((day) => [day.day_number, day]),
  );
  const weekGroups = new Map<number, number[]>();

  for (const dayNumber of activeDays) {
    const weekIndex = getCalendarWeekIndex(year, month, dayNumber);
    const current = weekGroups.get(weekIndex) || [];
    current.push(dayNumber);
    weekGroups.set(weekIndex, current);
  }

  const viralDays = new Set<number>();
  const styleHistory = new Map<string, number>();
  Array.from(weekGroups.entries()).forEach(([weekIndex, days]) => {
    const sortedDays = [...days].sort((a, b) => a - b);
    const weekendDay =
      sortedDays.find(
        (dayNumber) => new Date(year, month - 1, dayNumber).getDay() === 6,
      ) ??
      sortedDays.find(
        (dayNumber) => new Date(year, month - 1, dayNumber).getDay() === 0,
      ) ??
      sortedDays[sortedDays.length - 1];

    if (weekendDay) {
      viralDays.add(weekendDay);
    }
  });

  const days: PlannedDay[] = activeDays.map((dayNumber) => {
    const date = new Date(year, month - 1, dayNumber);
    const totalSlots = getPostCountForDay(
      dayNumber,
      business.growth_speed,
      date,
      planningPreferences?.availableTimes,
    );
    const dayPlan = dayStrategiesMap.get(dayNumber);

    if (!dayPlan) {
      throw new Error(`Planejamento do dia ${dayNumber} nao encontrado`);
    }

    const contentSequence = getContentSequenceForDay(
      business.growth_speed,
      totalSlots,
      dayNumber,
      dayPlan,
    );

    const rawPosts = Array.from({ length: totalSlots }, (_, slotIndex) => {
      const content_type =
        contentSequence[slotIndex] ||
        getContentTypeForSlot(
          dayNumber,
          totalSlots,
          slotIndex,
          date,
          business.growth_speed,
        );

      return {
        id: crypto.randomUUID(),
        slot_index: slotIndex,
        time: getVariedStrategicTime(
          content_type,
          slotIndex,
          dayNumber,
          dayPlan,
          planningPreferences?.availableTimes,
        ),
        content_type,
        subtype: getEditorialSubtypeForSeed(
          dayPlan,
          content_type,
          slotIndex,
          totalSlots,
          getVariedStrategicTime(
            content_type,
            slotIndex,
            dayNumber,
            dayPlan,
            planningPreferences?.availableTimes,
          ),
          content_type === "Reels" && viralDays.has(dayNumber) && slotIndex === 0,
        ),
        is_viral_candidate:
          content_type === "Reels" && viralDays.has(dayNumber) && slotIndex === 0,
        platform_tip: null,
      };
    });

    const posts = assignStylesToDay(rawPosts, dayPlan, dayNumber, styleHistory);

    posts.forEach((post) => {
      post.platform_tip = getPlatformTip(post.subtype, post.time);
    });

    return {
      day_number: dayNumber,
      posts,
      focus_theme: dayPlan.focus_theme,
      content_pillar: dayPlan.content_pillar,
      primary_format: dayPlan.primary_format,
      primary_subtype: dayPlan.primary_subtype,
      posting_window: dayPlan.posting_window,
      story_interaction: dayPlan.story_interaction,
    };
  });

  return days;
}

function splitDaysByWeek(year: number, month: number, days: PlannedDay[]) {
  const weekMap = new Map<number, PlannedDay[]>();

  days.forEach((day) => {
    const weekIndex = getCalendarWeekIndex(year, month, day.day_number);
    const current = weekMap.get(weekIndex) || [];
    current.push(day);
    weekMap.set(weekIndex, current);
  });

  return Array.from(weekMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([weekIndex, weekDays]) => ({
      weekIndex,
      days: weekDays.sort((a, b) => a.day_number - b.day_number),
    }));
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Resposta da IA sem JSON valido");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeHashtags(hashtags: unknown, niche: string) {
  const raw =
    Array.isArray(hashtags) ? hashtags.join(" ") : typeof hashtags === "string" ? hashtags : "";

  const tokens = raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => (token.startsWith("#") ? token : `#${slugify(token)}`))
    .filter((token) => token !== "#");

  if (tokens.length > 0) {
    return uniqueStrings(tokens).slice(0, 8).join(" ");
  }

  return generateSpecificHashtags(niche);
}

function generateSpecificHashtags(niche: string) {
  const words = normalizeText(niche)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  const compact = words.join("");
  const first = words[0] || "negocio";
  const second = words[1] || "brasil";

  return uniqueStrings([
    `#${compact || "negociolocal"}`,
    `#${first}`,
    `#${first}${second}`,
    `#${compact || first}brasil`,
    `#${first}premium`,
    `#${first}local`,
    "#negociolocal",
    "#marcaprofissional",
  ])
    .slice(0, 8)
    .join(" ");
}

function buildVisualPrompt(
  business: BusinessProfile,
  topic: string,
  contentType: string,
  isViral: boolean,
) {
  const palette = getBrandPaletteDescription(business.brand_colors);
  const emphasis =
    contentType === "Carrossel"
      ? "square editorial composition with negative space for slide text"
      : contentType === "Stories"
        ? "vertical storytelling composition with clean top and bottom safe areas"
        : "premium social media composition with text-safe negative space";

  const viralHint = isViral
    ? "high contrast, dynamic motion feel, emotional tension, instantly scroll-stopping"
    : "confident, polished, premium, believable";

  return `${business.niche} branded campaign image about "${topic}". ${emphasis}. Dark premium background, cinematic lighting, ${viralHint}, palette inspired by ${palette}. Ultra realistic, advertising photography, sharp focal subject, subtle depth, designed for Brazilian small business social media.`;
}

function buildHolidayTopic(
  business: BusinessProfile,
  dayPlan: PlannedDay,
  seed: PlannedPostSeed,
) {
  if (!dayPlan.holiday_title) return null;

  const niche = getNicheReference(business);
  const audience = getStoryAudienceReference(business);
  const phase = dayPlan.holiday_phase || "dia";
  const title = dayPlan.holiday_title;

  if (phase === "anticipacao") {
    if (seed.content_type === "Stories") {
      return `${title} chegando: como ${business.business_name} entra nessa conversa do jeito certo`;
    }

    if (seed.content_type === "Reels") {
      return `${title} chegando: a ideia que faz ${audience} lembrar da ${business.business_name}`;
    }

    return `${title} chegando: como conectar ${niche} a essa data sem soar forçado`;
  }

  if (phase === "encerramento") {
    if (seed.content_type === "Stories") {
      return `${title}: o que essa data movimentou por aqui`;
    }

    return `${title}: bastidor, agradecimento e o que ficou dessa campanha`;
  }

  if (seed.content_type === "Stories") {
    return `${title}: como isso conversa com quem busca ${niche} hoje`;
  }

  if (seed.content_type === "Reels") {
    return `${title}: o gancho certo para transformar a data em conversa e venda`;
  }

  return `${title}: o negocio como protagonista dessa data`;
}

function buildTopicFromSeed(
  business: BusinessProfile,
  dayPlan: PlannedDay,
  seed: PlannedPostSeed,
  year: number,
) {
  const audience = getShortAudience(business.target_audience);
  const monthReference = year;
  const baseTheme = dayPlan.focus_theme;
  const greetingLabel = resolveGreetingLabel(seed.time);
  const pillar = normalizeText(dayPlan.content_pillar).toLowerCase();
  const niche = getNicheReference(business);
  const storyAudience = getStoryAudienceReference(business);
  const holidayTopic = buildHolidayTopic(business, dayPlan, seed);

  if (holidayTopic) {
    return holidayTopic;
  }

  if (seed.is_viral_candidate) {
    return `${baseTheme}: o erro que mais faz ${audience} perder resultado em ${monthReference}`;
  }

  if (seed.style_id) {
    switch (seed.style_id) {
      case "H04":
        return buildCaixinhaQuestion(business);
      case "H05":
        return `O que mais trava ${storyAudience} na hora de escolher ${niche}?`;
      case "H14":
        return `Respondendo o que chegou sobre ${niche}`;
      case "H03":
      case "H15":
        return `Por dentro da ${business.business_name}: como ${baseTheme.toLowerCase()} acontece na pratica`;
      case "H16":
        return `O erro que eu cometi em ${baseTheme.toLowerCase()} e o que aprendi com isso`;
      case "H17":
        return `O que eu faria diferente hoje para melhorar ${baseTheme.toLowerCase()}`;
      case "H21":
        return `Se voce trabalha com ${business.niche}, vai se identificar com isso`;
      case "F01":
        return `${baseTheme}: qual caminho faz mais sentido para voce`;
      case "F02":
        return `5 erros que sabotam ${baseTheme.toLowerCase()}`;
      case "F03":
        return `O passo a passo mais claro para melhorar ${baseTheme.toLowerCase()}`;
      case "F08":
        return `Mito ou verdade: o que quase todo mundo entende errado sobre ${baseTheme.toLowerCase()}`;
      case "F13":
        return `O que ninguem te conta sobre ${baseTheme.toLowerCase()}`;
      case "F15":
        return `O que esse cliente percebeu depois de ajustar ${baseTheme.toLowerCase()}`;
      case "R03":
        return `A trend que faz sentido para ${business.niche} quando o assunto e ${baseTheme.toLowerCase()}`;
      case "R08":
        return `3 erros silenciosos em ${baseTheme.toLowerCase()} que quase ninguem percebe`;
      case "R15":
        return `A verdade que pouca gente aceita sobre ${baseTheme.toLowerCase()}`;
      case "R17":
        return `O dado que muda completamente sua visao sobre ${baseTheme.toLowerCase()}`;
      case "R20":
        return `Tutorial express: como melhorar ${baseTheme.toLowerCase()} sem complicar`;
      default:
        break;
    }
  }

  if (seed.subtype) {
    switch (seed.subtype) {
      case "HISTORY_BOMDIABOATARDE":
        return `${greetingLabel} com um ponto que muda ${baseTheme.toLowerCase()}`;
      case "HISTORY_CAIXINHA":
        return buildCaixinhaQuestion(business);
      case "HISTORY_BASTIDORES":
        return `Bastidores reais de ${baseTheme.toLowerCase()}`;
      case "HISTORY_DICA":
        return `A dica simples que melhora ${baseTheme.toLowerCase()}`;
      case "HISTORY_ENQUETE":
        return buildEnqueteQuestion(business);
      case "FEED_FOTO":
        return `O detalhe que faz ${baseTheme.toLowerCase()} parecer mais forte`;
      case "FEED_CARROSSEL":
        return `O guia mais claro para entender ${baseTheme.toLowerCase()}`;
      case "REELS_RAPIDO":
        return `O ponto rapido que pode mudar ${baseTheme.toLowerCase()}`;
      case "REELS_EDUCATIVO":
        return `O que voce precisa entender sobre ${baseTheme.toLowerCase()}`;
      default:
        break;
    }
  }

  if (seed.content_type === "Stories") {
    if (dayPlan.story_interaction === "caixinha") {
      return buildCaixinhaQuestion(business);
    }

    return buildEnqueteQuestion(business);
  }

  if (seed.content_type === "Reels") {
    if (pillar.includes("erro")) {
      return `Reels de erro comum: ${baseTheme}`;
    }

    if (pillar.includes("bastidor")) {
      return `Reels de bastidor: ${baseTheme}`;
    }

    return `Reels de dica rápida: ${baseTheme}`;
  }

  if (seed.content_type === "Carrossel") {
    if (pillar.includes("comparativo")) {
      return `Carrossel comparativo: ${baseTheme}`;
    }

    return `Carrossel educativo: ${baseTheme}`;
  }

  if (seed.content_type === "Live") {
    return `Live prática: ${baseTheme}`;
  }

  if (pillar.includes("prova")) {
    return `Prova social do dia: ${baseTheme}`;
  }

  return `Conteúdo do dia: ${baseTheme}`;
}

function getPublicationType(seed: PlannedPostSeed) {
  return seed.style_family || getStyleFamilyForContentType(seed.content_type);
}

function buildSummaryFromSeed(topic: string, seed: PlannedPostSeed) {
  const compactTopic = topic.replace(/[.!?]+$/g, "").trim();

  switch (seed.style_id) {
    case "H04":
    case "H05":
      return `Abre uma caixinha conectada ao tema ${compactTopic.toLowerCase()}.`;
    case "H14":
      return "Continua a conversa da caixinha anterior e responde as primeiras duvidas.";
    case "H06":
    case "H07":
      return "Lanca uma enquete simples para aquecer a interacao do dia.";
    case "H03":
    case "H15":
      return "Mostra um bastidor real e aproxima o seguidor da rotina do negocio.";
    case "F01":
      return "Compara dois caminhos do nicho e ajuda o seguidor a escolher melhor.";
    case "F02":
      return "Lista os erros mais comuns que atrapalham esse resultado.";
    case "F03":
      return "Ensina o caminho pratico para aplicar esse tema com clareza.";
    case "R03":
      return "Adapta uma trend ao nicho com um gancho forte e facil de gravar.";
    case "R08":
      return "Entrega uma lista rapida com erros que geram identificacao imediata.";
    case "R17":
      return "Abre com um dado forte e conecta isso ao contexto real do cliente.";
    default:
      break;
  }

  if (seed.content_type === "Stories") {
    return `Story rapido e natural para puxar conversa sobre ${compactTopic.toLowerCase()}.`;
  }

  if (seed.content_type === "Carrossel") {
    return `Carrossel objetivo para explicar ${compactTopic.toLowerCase()} em etapas simples.`;
  }

  if (seed.content_type === "Post Estatico") {
    return "Post estatico com foco em posicionamento e leitura rapida do tema.";
  }

  return `Reels direto ao ponto sobre ${compactTopic.toLowerCase()} com CTA no final.`;
}

function buildCtaFromSeed(business: BusinessProfile, seed: PlannedPostSeed) {
  switch (getPublicationType(seed)) {
    case "HISTORY":
      if (seed.style_id === "H14") {
        return "Me manda mais duvidas e eu continuo respondendo por aqui.";
      }

      if (seed.style_id === "H04" || seed.style_id === "H05") {
        return "Responde a caixinha agora que eu volto no proximo story.";
      }

      return "Me responde aqui e continua comigo no proximo story.";
    case "REELS":
      return `Salva este video e me chama no direct se quiser ajuda com ${business.niche}.`;
    default:
      if (seed.subtype === "FEED_FOTO") {
        return `Se isso fez sentido, salva o post e chama a ${business.business_name}.`;
      }

      return "Salva este carrossel e compartilha com quem precisa ver isso.";
  }
}

function buildCaptionFromSeed(
  business: BusinessProfile,
  topic: string,
  seed: PlannedPostSeed,
) {
  const audience = getShortAudience(business.target_audience).toLowerCase();
  const cta = buildCtaFromSeed(business, seed);

  if (seed.content_type === "Stories") {
    return null;
  }

  if (seed.subtype === "FEED_CARROSSEL") {
    return `${topic}\n\nMuita gente tenta melhorar ${business.niche} sem entender o que realmente pesa na decisao de quem compra. Quando voce organiza a mensagem, corta o excesso e mostra o caminho certo, o conteudo para de parecer improvisado e passa a gerar confianca de verdade.\n\nEste carrossel foi pensado para ${audience} enxergar com mais clareza o que fazer agora. ${cta}`;
  }

  if (seed.subtype === "FEED_FOTO") {
    return `${topic}\n\nUma imagem real, limpa e bem escolhida ajuda ${audience} a perceber valor em ${business.niche} antes mesmo do primeiro contato. Mostre contexto, cuidado e confianca. ${cta}`;
  }

  return `${topic}\n\nSe voce quer crescer em ${business.niche} com mais clareza, consistencia e conteudo que conversa com ${audience}, este video ja te mostra um caminho pratico para aplicar hoje. ${cta}`;
}

function buildSlidesFromSeed(
  business: BusinessProfile,
  topic: string,
  seed: PlannedPostSeed,
) {
  if (seed.subtype !== "FEED_CARROSSEL") {
    return null;
  }

  const audience = getShortAudience(business.target_audience).toLowerCase();

  return [
    {
      numero: 1,
      tipo: "capa",
      texto_principal: topic,
      texto_secundario: "Passe para o lado",
    },
    {
      numero: 2,
      tipo: "conteudo",
      texto_principal: "O erro mais comum",
      texto_secundario: `Quase sempre ${audience} perde resultado por falta de clareza no processo.`,
    },
    {
      numero: 3,
      tipo: "conteudo",
      texto_principal: "O que muda o jogo",
      texto_secundario: `Organizar mensagem, prova e consistencia faz ${business.niche} parecer mais forte.`,
    },
    {
      numero: 4,
      tipo: "conteudo",
      texto_principal: "Como aplicar hoje",
      texto_secundario: "Corte o excesso, simplifique a promessa e mostre um exemplo real.",
    },
    {
      numero: 5,
      tipo: "cta",
      texto_principal: "Salva este conteudo",
      texto_secundario: `Depois me chama e eu te mostro como aplicar isso na ${business.business_name}.`,
    },
  ];
}

function buildFallbackScript(
  business: BusinessProfile,
  seed: PlannedPostSeed,
  topic: string,
) {
  const audience = getShortAudience(business.target_audience);
  const responsible = business.responsible_name?.trim() || "voce";
  const niche = getNicheReference(business);
  const hour = Number.parseInt(seed.time.split(":")[0] || "0", 10);

  if (seed.subtype === "HISTORY_BOMDIABOATARDE" || (seed.slot_index === 0 && hour < 10)) {
    return buildGreetingStoryFallback(business, topic, seed.time);
  }

  if (
    seed.subtype === "HISTORY_CAIXINHA" ||
    seed.style_id === "H04" ||
    seed.style_id === "H05"
  ) {
    return buildCaixinhaStoryFallback(business, topic, responsible);
  }

  if (seed.subtype === "HISTORY_ENQUETE") {
    return buildEnqueteStoryFallback(business, topic, responsible);
  }

  if (seed.style_id === "H14") {
    return buildCaixinhaResponseStoryFallback();
  }

  if (seed.subtype === "HISTORY_BASTIDORES") {
    return buildBastidorStoryFallback(business, topic);
  }

  if (seed.subtype === "HISTORY_DICA") {
    return buildTipStoryFallback(business, topic);
  }

  if (seed.subtype === "FEED_CARROSSEL" || seed.content_type === "Carrossel") {
    return buildCarouselFallback(business, topic, audience);
  }

  if (seed.subtype === "FEED_FOTO" || seed.content_type === "Post Estatico") {
    return buildFeedPhotoFallback(business, topic, audience);
  }

  if (seed.is_viral_candidate) {
    return `CENA 1 - Gancho
PASSO A PASSO:
1. Abra a camera e grave na vertical.
2. Nos 3 primeiros segundos, fale este gancho: Se voce acha que todo ${niche} entrega a mesma coisa, presta atencao nisso.
3. Olhe direto para a camera e fale com energia, sem parecer decorado.

CENA 2 - Desenvolvimento
PASSO A PASSO:
1. Em seguida fale: O que muda o jogo em ${niche} nao e detalhe bonito ou promessa pronta. E quando voce mostra processo, consistencia e resultado real de um jeito que a pessoa sente a diferenca.
2. Mostre contraste, surpresa, transformacao ou um antes e depois real do seu contexto.
3. Mantenha cortes curtos para aumentar impacto emocional.

CTA FINAL
PASSO A PASSO:
1. Volte para a camera frontal.
2. Grave falando: Se voce quer entender melhor como escolher ${niche} com mais seguranca, salva este video e me chama no direct.
3. Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.`;
  }

  if (seed.content_type === "Reels") {
    return `CENA 1 - Gancho
PASSO A PASSO:
1. Abra a camera e grave na vertical, em um lugar com boa luz.
2. Nos 3 primeiros segundos, fale este gancho: Se voce quer tomar uma decisao melhor em ${niche}, presta atencao nisso.
3. Fale de forma natural, como se estivesse explicando isso para um cliente.

CENA 2 - Desenvolvimento
PASSO A PASSO:
1. Mostre uma cena real do seu ambiente, atendimento, produto ou processo.
2. Em seguida fale: Quando ${audience} entende o que observar em ${niche}, a decisao fica mais clara e segura.
3. Use um corte rapido para manter o video dinamico.

CTA FINAL
PASSO A PASSO:
1. Volte para a camera.
2. Grave falando: Salva este video e me chama no direct se quiser ajuda com ${niche}.
3. Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.`;
  }

  if (seed.content_type === "Stories") {
    return buildEnqueteStoryFallback(business, topic, responsible);
  }

  if (seed.content_type === "Live") {
    return `Antes da live
1. Poste nos Stories avisando com a enquete "Voce vem?" 24h antes.

Abertura
1. Diga seu nome e o nome do negocio.
2. Fale: "Hoje eu vou falar sobre ${topic}. Fica comigo ate o final porque tem uma dica que pouca gente aplica."

Bloco 1
1. Explique o contexto do tema e por que isso importa para ${audience}.

Bloco 2
1. Mostre na pratica o seu ambiente, produto ou processo real da ${business.business_name}.

Bloco 3
1. Responda perguntas do chat ao vivo e leia os comentarios em voz alta.

Encerramento
1. Fale: "Se voce quer saber mais sobre ${business.niche}, me chama no direct ou acessa o link da bio."`;
  }

  return `Descricao visual: Foto do produto, ambiente ou equipe de ${business.business_name}. Iluminacao natural ou de estudio. Composicao limpa com espaco para texto sobreposto.
Texto sobreposto na imagem: "${topic}"
Legenda pronta:
${topic}.

${audience} merece um ${business.niche} que realmente entrega resultado. Na ${business.business_name}, cada detalhe e pensado para voce sair satisfeito.

Quer saber mais? Manda "quero" no direct ou acessa o link da bio.

CTA: Salva esse post pra lembrar depois.`;
}

function buildStoryQuestionTip() {
  return "Se ninguem responder, voce mesmo pode fazer a pergunta e responder. Isso gera conteudo real e nao ha nada de errado nisso.";
}

function getStoryAudienceReference(business: BusinessProfile) {
  const audience = normalizeText(getShortAudience(business.target_audience)).toLowerCase();

  if (!audience || audience === "o seu publico ideal") {
    return "quem acompanha a gente";
  }

  return audience;
}

function getNicheReference(business: BusinessProfile) {
  const niche = normalizeText(business.niche).toLowerCase();

  return niche || "isso";
}

function buildCaixinhaQuestion(business: BusinessProfile) {
  const niche = getNicheReference(business);
  const audience = getStoryAudienceReference(business);

  if (audience === "quem acompanha a gente") {
    return `Qual e a sua maior dificuldade hoje com ${niche}?`;
  }

  return `Pensando em ${audience}, qual e a maior dificuldade hoje com ${niche}?`;
}

function buildEnqueteQuestion(business: BusinessProfile) {
  const niche = getNicheReference(business);
  const audience = getStoryAudienceReference(business);

  if (audience === "quem acompanha a gente") {
    return `Na hora de escolher ${niche}, o que pesa mais para voce hoje?`;
  }

  return `Para ${audience}, o que pesa mais na hora de escolher ${niche}?`;
}

function buildGreetingStoryFallback(
  business: BusinessProfile,
  topic: string,
  time: string,
) {
  const greeting = resolveGreetingLabel(time);
  const niche = getNicheReference(business);

  return `STORY 1 - ${greeting}
PASSO A PASSO:
1. Abra a camera de Stories no primeiro horario disponivel do dia.
2. Grave falando: ${greeting}. Hoje eu quero te mostrar um detalhe do dia que faz diferenca para quem busca ${niche} com mais seguranca.
3. Olhe para a camera com naturalidade, sem ler, e mostre rapidamente o ambiente ao fundo.
4. Feche dizendo que ao longo do dia voce vai mostrar exemplos reais, bastidores e detalhes praticos para quem acompanha a ${business.business_name}.`;
}

function buildCaixinhaStoryFallback(
  business: BusinessProfile,
  topic: string,
  responsible: string,
) {
  const audience = getStoryAudienceReference(business);
  const question = buildCaixinhaQuestion(business);

  return `STORY 1 - Caixinha de perguntas
PASSO A PASSO:
1. Abra a camera de Stories e grave mostrando seu rosto.
2. Grave falando: Eu sou ${responsible}, da ${business.business_name}, e hoje eu quero ouvir ${audience}.
3. Adicione a caixinha com a pergunta: ${question}
4. ${buildStoryQuestionTip()}

STORY 2 - Aviso de resposta
PASSO A PASSO:
1. Grave outro video curto na camera frontal.
2. Grave falando: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.
3. Mantenha a fala curta, humana e conectada ao Story 1.

STORY 3 - Primeira resposta
PASSO A PASSO:
1. Abra a camera sem introducao. Voce ja esta no meio da conversa.
2. Responda diretamente a primeira pergunta recebida na caixinha.
3. Seja objetivo e use um exemplo real do seu nicho.
4. Nao repita que abriu a caixinha. So responda.

DICAS - Continuacao
PASSO A PASSO:
1. Continue respondendo as demais perguntas, uma por uma.
2. Seja natural, sem roteiro fixo.
3. Se receber poucas perguntas, aprofunde mais cada resposta.`;
}

function buildEnqueteStoryFallback(
  business: BusinessProfile,
  topic: string,
  responsible: string,
) {
  const audience = getStoryAudienceReference(business);
  const question = buildEnqueteQuestion(business);

  return `STORY 1 - Enquete
PASSO A PASSO:
1. Abra a camera de Stories e grave mostrando seu rosto.
2. Grave falando: Eu sou ${responsible}, da ${business.business_name}, e hoje eu quero ouvir ${audience}.
3. Adicione a enquete com a pergunta: ${question}
4. Use as opcoes: Rapidez / Confianca.
5. ${buildStoryQuestionTip()}

STORY 2 - Aviso de resposta
PASSO A PASSO:
1. Grave outro video curto na camera frontal.
2. Grave falando: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.
3. Mantenha a fala curta e conectada ao Story 1.

STORY 3 - Primeira resposta
PASSO A PASSO:
1. Abra a camera sem reabrir o assunto do zero.
2. Responda diretamente ao ponto que mais apareceu depois da enquete.
3. Seja direto, use exemplos reais e fale sem parecer decorado.
4. Mostre um detalhe do seu ambiente ou processo enquanto responde.

DICAS - Continuacao
PASSO A PASSO:
1. Continue respondendo as reacoes e duvidas que aparecerem, uma por uma.
2. Seja natural, sem roteiro fixo.
3. Se receber poucas perguntas, aprofunde mais cada resposta.`;
}

function buildCaixinhaResponseStoryFallback() {
  return `STORY 1 - Primeira resposta
PASSO A PASSO:
1. Abra a camera sem introducao. Voce ja esta no meio da conversa.
2. Responda diretamente a primeira pergunta recebida na caixinha.
3. Seja objetivo e use um exemplo real do seu nicho.
4. Nao repita que abriu a caixinha. So responda.

DICAS - Continuacao
PASSO A PASSO:
1. Continue respondendo as demais perguntas, uma por uma.
2. Seja natural, sem roteiro fixo.
3. Se receber poucas perguntas, aprofunde mais cada resposta.`;
}

function buildBastidorStoryFallback(
  business: BusinessProfile,
  topic: string,
) {
  const niche = getNicheReference(business);

  return `STORY 1 - Bastidor
PASSO A PASSO:
1. Abra a camera e mostre um bastidor real da ${business.business_name}.
2. Grave falando: Hoje eu quero te mostrar um bastidor que influencia muito a experiencia de quem busca ${niche}.
3. Caminhe pelo ambiente ou mostre a tela, o produto ou o processo enquanto fala.
4. Feche com uma pergunta simples para gerar conversa no direct.`;
}

function buildTipStoryFallback(
  business: BusinessProfile,
  topic: string,
) {
  const niche = getNicheReference(business);

  return `STORY 1 - Dica rapida
PASSO A PASSO:
1. Abra a camera de Stories em um lugar com boa luz.
2. Grave falando: Se voce quer tomar uma decisao melhor em ${niche}, presta atencao nesse detalhe.
3. Entregue uma dica curta, especifica e aplicavel para quem acompanha a ${business.business_name}.
4. Feche com um CTA simples pedindo resposta ou compartilhamento no direct.`;
}

function buildCarouselFallback(
  business: BusinessProfile,
  topic: string,
  audience: string,
) {
  return `SLIDE 1 - Capa
PASSO A PASSO:
1. Crie esse slide no Canva.
2. Escreva no slide: ${topic}
3. Escreva no slide: Salva para nao esquecer
4. Adicione no rodape: Passe para o lado

SLIDE 2 - Contexto
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: O que quase todo mundo erra quando pensa em ${business.niche}.
3. Escreva no slide: Isso faz ${audience.toLowerCase()} perder clareza e resultado.

SLIDE 3 - Ajuste pratico
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: O primeiro ajuste e olhar para processo, consistencia e posicionamento.
3. Escreva no slide: Sem isso, o resultado fica instavel.

SLIDE 4 - Aplicacao real
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: Na pratica, o melhor caminho e simplificar a mensagem e provar o valor.
3. Escreva no slide: Isso aproxima voce de quem realmente quer comprar.

SLIDE 5 - CTA
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: Quer aplicar isso no seu perfil?
3. Escreva no slide: Salva este post e chama a ${business.business_name}.`;
}

function buildFeedPhotoFallback(
  business: BusinessProfile,
  topic: string,
  audience: string,
) {
  const staticCaption = `Mostre contexto real, detalhe bem cuidado e um ponto que passe confianca. Isso ajuda ${audience.toLowerCase()} a perceber valor em ${business.niche} com mais seguranca. Salva este post e chama a ${business.business_name}.`;

  return `POST ESTATICO - Foto estrategica
PASSO A PASSO:
1. Escolha uma foto real do seu ambiente, produto, equipe ou atendimento.
2. Use uma imagem limpa, com boa luz, que mostre um contexto real do seu nicho e reforce confianca para quem esta vendo.
3. Publique com esta legenda:
${staticCaption}
4. Feche a legenda com um CTA claro para salvar o post ou mandar mensagem.`;
}

function buildReelsFallback(
  business: BusinessProfile,
  topic: string,
  subtype: EditorialSubtype,
) {
  const hook =
    subtype === "REELS_RAPIDO"
      ? `Se voce quer melhorar ${business.niche}, presta atencao nisso.`
      : `Vou te mostrar o que realmente muda o resultado em ${business.niche}.`;
  const development =
    subtype === "REELS_RAPIDO"
      ? `O erro mais comum e tratar ${business.niche} de forma generica. O que funciona mesmo e olhar para processo, clareza e repeticao.`
      : `Quando alguem tenta crescer em ${business.niche} sem metodo, normalmente perde tempo, energia e oportunidade. O que faz diferenca e entender o contexto, ajustar a mensagem e executar com consistencia.`;
  const closing = `Se isso fez sentido para voce, salva este video e me chama no direct para falar sobre ${business.niche}.`;

  return `CENA 1 - Abertura
PASSO A PASSO:
1. Abra a camera e grave na vertical.
2. Nos 3 primeiros segundos, fale este gancho: ${hook}
3. Olhe direto para a camera e fale como uma pessoa real.

CENA 2 - Desenvolvimento
PASSO A PASSO:
1. Em seguida fale: ${development}
2. Mostre um detalhe real do seu processo, tela, ambiente ou atendimento enquanto explica.
3. Mantenha cortes curtos e sem enrolacao.

CTA FINAL
PASSO A PASSO:
1. Feche dizendo: ${closing}
2. Termine olhando para a camera, sem pressa e sem parecer script decorado.
3. Na edicao: cortes rapidos, legenda e musica popular no momento da gravacao.
4. Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.`;
}

function buildFallbackScriptV2(
  business: BusinessProfile,
  dayPlan: PlannedDay,
  seed: PlannedPostSeed,
  topic: string,
) {
  const audience = getShortAudience(business.target_audience);
  const responsible = business.responsible_name?.trim() || "você";
  const pillar = normalizeText(dayPlan.content_pillar).toLowerCase();
  const useQuestionBox = dayPlan.story_interaction === "caixinha";
  const niche = getNicheReference(business);
  const storyAudience = getStoryAudienceReference(business);
  const hour = Number.parseInt(seed.time.split(":")[0] || "0", 10);

  if (seed.subtype === "HISTORY_BOMDIABOATARDE") {
    return buildGreetingStoryFallback(business, topic, seed.time);
  }

  if (seed.subtype === "HISTORY_CAIXINHA") {
    return buildCaixinhaStoryFallback(business, topic, responsible);
  }

  if (seed.subtype === "HISTORY_ENQUETE") {
    return buildEnqueteStoryFallback(business, topic, responsible);
  }

  if (seed.subtype === "HISTORY_BASTIDORES") {
    return buildBastidorStoryFallback(business, topic);
  }

  if (seed.style_id === "H14") {
    return buildCaixinhaResponseStoryFallback();
  }

  if (seed.subtype === "HISTORY_DICA") {
    return buildTipStoryFallback(business, topic);
  }

  if (seed.subtype === "FEED_CARROSSEL") {
    return buildCarouselFallback(business, topic, audience);
  }

  if (seed.subtype === "FEED_FOTO") {
    return buildFeedPhotoFallback(business, topic, audience);
  }

  if (seed.subtype === "REELS_RAPIDO" || seed.subtype === "REELS_EDUCATIVO") {
    return buildReelsFallback(business, topic, seed.subtype);
  }

  if (seed.is_viral_candidate) {
    return `CENA 1 - Gancho
PASSO A PASSO:
1. Abra a camera e grave na vertical.
2. Nos 3 primeiros segundos, fale este gancho: Se voce acha que todo ${niche} entrega a mesma coisa, presta atencao nisso.
3. Olhe direto para a camera e fale com energia, sem parecer decorado.

CENA 2 - Desenvolvimento
PASSO A PASSO:
1. Em seguida fale: O que muda o jogo em ${niche} nao e detalhe bonito ou promessa pronta. E quando voce mostra processo, consistencia e resultado real de um jeito que a pessoa sente a diferenca.
2. Mostre contraste, surpresa, transformacao ou um antes e depois real do seu contexto.
3. Mantenha cortes curtos para aumentar impacto emocional.

CTA FINAL
PASSO A PASSO:
1. Volte para a camera frontal.
2. Grave falando: Se voce quer entender melhor como escolher ${niche} com mais seguranca, salva este video e me chama no direct.
3. Feche olhando para a camera, sem pressa.
4. Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.`;
  }

  if (seed.content_type === "Reels") {
    const reelsHook = pillar.includes("bastidor")
      ? `Vou te mostrar um detalhe de bastidor que faz diferenca em ${niche}.`
      : pillar.includes("erro")
        ? `Tem um erro comum em ${niche} que muita gente so percebe tarde demais.`
        : `Se voce quer tomar uma decisao melhor em ${niche}, presta atencao nisso.`;
    const reelsDevelopment = pillar.includes("bastidor")
      ? `1. Mostre uma cena real do bastidor da ${business.business_name}.\n2. Em seguida fale: ${audience} quase nunca ve esse momento, mas e aqui que a experiencia com ${niche} ganha consistencia.\n3. Use um corte rapido para deixar o video dinamico.`
      : pillar.includes("erro")
        ? `1. Mostre um exemplo simples do erro mais comum.\n2. Em seguida fale: ${audience} costuma errar nisso quando procura ${niche}, porque olha so para a superficie e ignora o que realmente pesa na decisao.\n3. Use um corte rapido para reforcar contraste entre erro e acerto.`
        : `1. Mostre uma cena real do seu ambiente, atendimento, produto ou processo.\n2. Em seguida fale: Quando ${audience} entende o que observar em ${niche}, a decisao fica mais clara e segura.\n3. Use um corte rapido para manter o video dinamico.`;

    return `CENA 1 - Gancho
PASSO A PASSO:
1. Abra a camera e grave na vertical, em um lugar com boa luz.
2. Nos 3 primeiros segundos, fale este gancho: ${reelsHook}
3. Fale como se estivesse explicando isso para um cliente, sem parecer decorado.

CENA 2 - Desenvolvimento
PASSO A PASSO:
${reelsDevelopment}

CTA FINAL
PASSO A PASSO:
1. Volte para a camera.
2. Feche dizendo: Salva este video e me chama no direct se quiser ajuda com ${niche}.
3. Revise os cortes antes de publicar.
4. Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.`;
  }

  if (seed.content_type === "Stories") {
    if (seed.slot_index === 0 && hour < 10) {
      return buildGreetingStoryFallback(business, topic, seed.time);
    }

    if (useQuestionBox) {
      return `STORY 1 - Caixinha de perguntas
PASSO A PASSO:
1. Abra a camera de Stories e grave um video curto mostrando seu rosto e o ambiente.
2. Grave falando: Eu sou ${responsible}, da ${business.business_name}, e hoje quero ouvir ${storyAudience}.
3. Olhe para a camera com naturalidade, sem ler.
4. Adicione a caixinha com a pergunta: ${buildCaixinhaQuestion(business)}
5. ${buildStoryQuestionTip()}

STORY 2 - Aviso de resposta
PASSO A PASSO:
1. Grave outro video curto na camera frontal.
2. Grave falando: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.
3. Mantenha a fala curta, humana e conectada ao Story 1.

STORY 3 - Primeira resposta
PASSO A PASSO:
1. Abra a camera sem introducao. Voce ja esta no meio da conversa.
2. Responda diretamente a primeira pergunta recebida na caixinha.
3. Seja direto, use exemplos reais e fale como se estivesse conversando com um cliente.
4. Nao repita que abriu a caixinha. So responda.

DICAS - Continuacao
PASSO A PASSO:
1. Continue respondendo as perguntas recebidas, uma por uma.
2. Seja natural, sem roteiro fixo.
3. Se receber poucas perguntas, aprofunde mais cada resposta.`;
    }

    return `STORY 1 - Enquete
PASSO A PASSO:
1. Abra a camera de Stories e grave um video curto mostrando seu rosto e o ambiente.
2. Grave falando: Eu sou ${responsible}, da ${business.business_name}, e hoje quero ouvir ${storyAudience}.
3. Olhe para a camera com naturalidade, sem ler.
4. Adicione a enquete com a pergunta: ${buildEnqueteQuestion(business)}
5. Use as opcoes: Rapidez / Confianca.
6. ${buildStoryQuestionTip()}

STORY 2 - Aviso de resposta
PASSO A PASSO:
1. Grave outro video curto na camera frontal.
2. Grave falando: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.
3. Mantenha a fala curta e conectada ao Story 1.

STORY 3 - Primeira resposta
PASSO A PASSO:
1. Abra a camera sem reabrir o assunto do zero.
2. Responda diretamente ao ponto que mais apareceu depois da enquete.
3. Seja direto, use exemplos reais e fale de forma natural.
4. Mostre um detalhe do seu ambiente ou processo enquanto responde.

DICAS - Continuacao
PASSO A PASSO:
1. Continue respondendo as perguntas recebidas, uma por uma.
2. Seja natural, sem roteiro fixo.
3. Se receber poucas perguntas, aprofunde mais cada resposta.`;
  }

  if (seed.content_type === "Carrossel") {
    const slideTwoLines = pillar.includes("comparativo")
      ? [
          `2. Escreva no slide: Compare duas opcoes olhando para clareza, processo e resultado.`,
          `3. Escreva no slide: O erro mais comum e decidir rapido demais e ignorar os sinais de consistencia.`,
          `4. Escreva no slide: O melhor caminho e avaliar o que realmente faz sentido para ${audience}.`,
        ]
      : [
          `2. Escreva no slide: O que mais pesa na escolha e entender o que realmente faz sentido para ${audience}.`,
          `3. Escreva no slide: O erro mais comum e decidir so pelo preco e ignorar o que muda o resultado.`,
          `4. Escreva no slide: O que faz diferenca mesmo e avaliar como ${niche} entrega confianca e resultado.`,
        ];

    return `SLIDE 1 - Capa
PASSO A PASSO:
1. Crie esse slide no Canva.
2. Titulo principal: "${topic}"
3. Subtitulo menor: "Salva para nao esquecer"
4. Adicione no rodape: "Passe para o lado"

SLIDE 2 - Conteudo
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
${slideTwoLines.join("\n")}

SLIDE 3 - Ajuste pratico
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: O ajuste mais importante e simplificar a mensagem e mostrar valor real.
3. Escreva no slide: Isso ajuda ${audience} a decidir com mais seguranca.

SLIDE 4 - Aplicacao real
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: Mostre um exemplo real, um detalhe do processo ou uma comparacao clara.
3. Escreva no slide: Quanto mais concreto, mais facil fica entender seu diferencial.

SLIDE 5 - CTA
PASSO A PASSO:
1. Crie esse slide no Canva seguindo o mesmo estilo da capa.
2. Escreva no slide: Quer aplicar isso no seu caso?
3. Escreva no slide: Salva este post e fala com a ${business.business_name}.
4. Revise se o texto esta curto, direto e facil de ler.`;
  }

  return buildFallbackScript(business, seed, topic);
}

function buildFallbackPost(
  business: BusinessProfile,
  dayPlan: PlannedDay,
  seed: PlannedPostSeed,
  year: number,
): GeneratedPost {
  const topic = buildTopicFromSeed(business, dayPlan, seed, year);
  const isViral = seed.is_viral_candidate;
  const legenda = buildCaptionFromSeed(business, topic, seed);
  const slides = buildSlidesFromSeed(business, topic, seed);

  return {
    slot_index: seed.slot_index,
    horario: seed.time,
    tipo: getPublicationType(seed),
    estilo_id: seed.style_id,
    titulo: topic,
    topic,
    roteiro_resumido: buildSummaryFromSeed(topic, seed),
    conectado_com:
      seed.connected_to_slot_index !== null &&
      seed.connected_to_slot_index !== undefined
        ? `slot:${seed.connected_to_slot_index}`
        : null,
    cta: buildCtaFromSeed(business, seed),
    legenda,
    slides,
    script: buildFallbackScriptV2(business, dayPlan, seed, topic),
    hashtags: generateSpecificHashtags(business.niche),
    visual_prompt: buildVisualPrompt(business, topic, seed.content_type, isViral),
    is_viral: isViral,
    subtype: seed.subtype,
    platform_tip: seed.platform_tip || null,
  };
}

function buildWeekPrompt(
  business: BusinessProfile,
  weekIndex: number,
  year: number,
  month: number,
  daysInMonth: number,
  weekDays: PlannedDay[],
) {
  const schedule = weekDays
    .map((day) => {
      const slots = day.posts
        .map(
          (post) =>
            `slot_index ${post.slot_index} | ${post.time} | ${post.content_type} | subtipo ${post.subtype} | viral_candidate ${post.is_viral_candidate ? "true" : "false"}${post.platform_tip ? ` | dica_plataforma ${post.platform_tip}` : ""}`,
        )
        .join("\n");

      return `Dia ${day.day_number} | tema_base ${day.focus_theme} | pilar ${day.content_pillar} | formato_prioritario ${day.primary_format} | janela_prioritaria ${day.posting_window} | story_interacao ${day.story_interaction}:\n${slots}`;
    })
    .join("\n\n");

  const strategyPrompt = `
Voce e um estrategista de conteudo criando uma estrategia mensal completa para:

NEGOCIO: ${business.business_name}
NICHO: ${business.niche}
PUBLICO-ALVO: ${business.target_audience}
OBJETIVO: ${business.main_goal}
ESTILO DE COMUNICACAO: ${business.communication_style}
VELOCIDADE: ${business.growth_speed}
DESCRICAO: ${business.brand_description}
CORES DA MARCA: ${business.brand_colors?.join(", ") || "nao definidas"}
ORIENTACAO DE OBJETIVO: ${getGoalStrategyGuidance(business.main_goal)}
ORIENTACAO DE ESTILO: ${getCommunicationStyleGuidance(business.communication_style)}

Crie conteudos apenas para os dias e slots desta semana ${weekIndex + 1} de ${MONTH_NAMES[month - 1]} de ${year}. O mes tem ${daysInMonth} dias.

REGRAS OBRIGATORIAS DE QUALIDADE:

1. CONTEUDO ESPECIFICO: Todo conteudo deve ser 100% especifico para o nicho "${business.niche}". NUNCA use exemplos genericos.

2. TITULOS CHAMATIVOS: Cada topic deve parar o scroll. Use numeros, perguntas, contraste, curiosidade ou situacao real.

3. REGRAS GERAIS DE ESCRITA:
   - Nunca use asteriscos em nenhuma parte do conteudo
   - O texto precisa soar natural, humano e direto, como o responsavel do negocio falando de verdade
   - Cada cliente tem sua propria estrategia. Evite modelos engessados e repetitivos
   - Nunca sugira gravacao na hora do almoco. Almoco pode ser horario de publicacao, nao de gravacao

4. ESTRUTURA OBRIGATORIA DOS FORMATOS:
   - Stories, Carrossel e Reels devem seguir esta estrutura:
     1. Titulo da etapa
     2. PASSO A PASSO
     3. Dentro dos passos, inclua o roteiro no momento certo usando frases como: Grave falando:
     4. Nao crie uma area separada chamada roteiro
     5. Cada passo deve ser curto, claro e executavel
   - Reels: use CENA 1, CENA 2, CENA 3 e CTA FINAL
   - Carrossel: use SLIDE 1, SLIDE 2 e SLIDE 3
   - Stories: use STORY 1, STORY 2, STORY 3 e STORY 4 quando fizer sentido

5. LOGICA OBRIGATORIA DOS STORIES:
   - Se o Story 1 for enquete SIM/NAO, o Story 2 precisa responder essa enquete como continuacao natural
   - Se o Story 1 for caixinha de perguntas, os stories seguintes devem responder as perguntas recebidas
   - Em todo Story com enquete ou caixinha, finalize com a dica:
     "Se ninguem responder, voce mesmo pode fazer a pergunta e responder - isso gera conteudo real e nao ha nada de errado nisso."
   - Priorize video do responsavel. Evite foto como base principal do story

6. ROTEIRO EMBUTIDO POR FORMATO:
   - Reels: escreva a fala exata dentro do passo correspondente, usando "Grave falando: ..."
   - Stories: escreva a fala exata dentro do passo correspondente, usando "Grave falando: ..."
   - Carrossel: escreva o texto exato de cada slide dentro do passo correspondente, usando "Escreva no slide: ..."
   - Post Estatico: texto exato da legenda (200-300 caracteres) pronto pra copiar e colar.
     Descreva a imagem ideal para este post.
   - Live: abertura, 3 blocos de conteudo e encerramento com CTA

7. RESPEITE O PLANEJAMENTO DE VOLUME:
   - Se a velocidade for moderado, mantenha a logica de Stories diarios, feed diario e Reels em alguns dias da semana.
   - Se a velocidade for rapido, mantenha a logica de muitos Stories por dia, feed diario, Reels diarios, Lives estrategicas e Reels viral no fim de semana.

8. VISUAL_PROMPT: Para cada post gere um prompt em ingles, especifico para busca de imagem de fundo. Cite luz, ambiente, composicao e paleta.

9. VARIEDADE OBRIGATORIA:
   - Reels educativos e de valor
   - Reels de bastidor ou prova
   - Stories com enquete, resposta, bastidor ou CTA
   - Posts com prova social ou oferta quando fizer sentido
   - Carrossel com no maximo 3 slides
   - Conteudo de oferta em no maximo 20% dos posts

   - Cada dia precisa parecer uma estrategia nova, com tema_base, formato_prioritario e abordagem proprios
   - Nunca repita o mesmo tema em dias consecutivos
   - Nunca repita o mesmo formato_prioritario em dias consecutivos
   - Use tema_base e pilar como fonte principal de variacao de cada dia

10. REELS VIRAL:
   - Se viral_candidate for true, marque is_viral true
   - Esse Reels precisa ser diferente dos demais, com potencial de compartilhamento, polemica leve, surpresa, transformacao ou curiosidade forte
   - Se viral_candidate for false, is_viral deve ser false

11. HASHTAGS ESPECIFICAS:
   - Use hashtags do nicho do cliente
   - Nao use hashtags genericas demais como principal
   - Retorne em string unica separada por espacos

12. ESTRUTURA:
   - Mantenha exatamente os day_number e slot_index fornecidos
   - Nao invente slots extras
   - O tipo de conteudo ja esta definido no planejamento e nao deve ser trocado

PLANEJAMENTO FIXO DESTA SEMANA:
${schedule}

Retorne APENAS JSON valido, sem markdown, neste formato:
{
  "days": [
    {
      "day_number": 1,
      "posts": [
        {
          "slot_index": 0,
          "topic": "titulo especifico",
          "script": "roteiro completo",
          "hashtags": "#tag1 #tag2",
          "visual_prompt": "prompt in english",
          "is_viral": false
        }
      ]
    }
  ]
}
`;

  return strategyPrompt.trim();
}

function buildWeekPromptV2(
  business: BusinessProfile,
  weekIndex: number,
  year: number,
  month: number,
  daysInMonth: number,
  weekDays: PlannedDay[],
) {
  const schedule = weekDays
    .map((day) => {
      const slots = day.posts
        .map(
          (post) =>
            `slot_index ${post.slot_index} | ${post.time} | ${post.content_type} | viral_candidate ${post.is_viral_candidate ? "true" : "false"}`,
        )
        .join("\n");

      return `Dia ${day.day_number} | tema_base ${day.focus_theme} | pilar ${day.content_pillar} | formato_prioritario ${day.primary_format} | janela_prioritaria ${day.posting_window} | story_interacao ${day.story_interaction}:\n${slots}`;
    })
    .join("\n\n");

  const strategyPrompt = `
Você é um estrategista de conteúdo criando uma estratégia mensal completa para:

NEGÓCIO: ${business.business_name}
NICHO: ${business.niche}
PÚBLICO-ALVO: ${business.target_audience}
OBJETIVO: ${business.main_goal}
ESTILO DE COMUNICAÇÃO: ${business.communication_style}
VELOCIDADE: ${business.growth_speed}
DESCRIÇÃO: ${business.brand_description}
CORES DA MARCA: ${business.brand_colors?.join(", ") || "nao definidas"}
ORIENTAÇÃO DE OBJETIVO: ${getGoalStrategyGuidance(business.main_goal)}
ORIENTAÇÃO DE ESTILO: ${getCommunicationStyleGuidanceV2(business.communication_style)}

Crie conteúdos apenas para os dias e slots desta semana ${weekIndex + 1} de ${MONTH_NAMES[month - 1]} de ${year}. O mês tem ${daysInMonth} dias.

REGRAS OBRIGATÓRIAS DE QUALIDADE:

1. CONTEÚDO ESPECÍFICO: Todo conteúdo deve ser 100% específico para o nicho "${business.niche}". Nunca use exemplos genéricos.

2. TÍTULOS CHAMATIVOS: Cada topic deve parar o scroll. Use números, perguntas, contraste, curiosidade ou situação real.

3. REGRAS GERAIS DE ESCRITA:
   - Nunca use asteriscos em nenhuma parte do conteúdo
   - Use português do Brasil com acentuação correta
   - Nunca use emojis
   - O texto precisa soar natural, humano e direto, como o responsável do negócio falando de verdade
   - Cada cliente tem sua própria estratégia. Evite modelos engessados e repetitivos
   - Nunca sugira gravação na hora do almoço. Almoço pode ser horário de publicação, não de gravação
   - Nunca agende dois temas diferentes no mesmo horário
   - Se houver temas distintos no mesmo dia, separe por pelo menos 1 hora entre publicações

4. ESTRUTURA OBRIGATÓRIA DOS FORMATOS:
   - Stories, Carrossel e Reels devem seguir esta estrutura:
     1. Título da etapa
     2. PASSO A PASSO
     3. Dentro dos passos, inclua o roteiro no momento certo usando frases como: Grave falando: "..."
     4. Não crie uma área separada chamada roteiro
     5. Cada passo deve ser curto, claro e executável
   - Reels: use CENA 1, CENA 2, CENA 3 e CTA FINAL
   - Carrossel: use SLIDE 1, SLIDE 2 e SLIDE 3, nessa ordem, sem pular
   - Stories: use STORY 1, STORY 2, STORY 3 e DICAS - Continuacao, nessa ordem

5. LÓGICA OBRIGATÓRIA DOS STORIES:
   - STORY 1: lance uma caixinha de perguntas ou uma enquete
   - STORY 2: grave um aviso curto dizendo que vai responder no proximo story. Exemplo: Recebi varias respostas aqui, vou responder uma por uma. Fica ligado.
   - STORY 3: instrua o criador a responder a primeira pergunta recebida de forma natural, direta e detalhada
   - DICAS - Continuacao: instrua o criador a continuar respondendo as perguntas seguintes, uma por uma, sem roteiro fixo
   - A partir do STORY 3, nunca escreva roteiro palavra por palavra. Apenas instrua o criador sobre como responder
   - Em todo Story com enquete ou caixinha, finalize com a dica exata:
     "Se ninguém responder, você mesmo pode fazer a pergunta e responder. Isso gera conteúdo real e não há nada de errado nisso."
   - Priorize vídeo do responsável. Evite foto como base principal do story

6. ROTEIRO EMBUTIDO POR FORMATO:
   - Reels: escreva a fala exata dentro do passo correspondente, usando "Grave falando: ...". Feche com a dica exata: "Edite com cortes rápidos, adicione legenda e escolha uma música popular no momento em que você está gravando."
   - Stories: escreva o roteiro apenas em STORY 1 e STORY 2. No STORY 3, instrua assim: Responda a primeira pergunta recebida na caixinha. Seja direto, use exemplos reais. Em DICAS - Continuacao, instrua assim: Continue respondendo as perguntas recebidas, uma por uma. Seja natural, sem roteiro fixo. Se receber poucas perguntas, aprofunde mais cada resposta.
   - Carrossel: escreva o texto exato de cada slide dentro do passo correspondente, usando "Escreva no slide: ...". No SLIDE 1 inclua obrigatoriamente a frase "Passe para o lado" no rodapé
   - Post Estático: texto exato da legenda, pronto para copiar e colar. Descreva a imagem ideal para este post
   - Live: abertura, 3 blocos de conteúdo e encerramento com CTA

7. RESPEITE O PLANEJAMENTO DE VOLUME:
   - Se a velocidade for moderado, mantenha a lógica de Stories diários, feed diário e Reels em alguns dias da semana
   - Se a velocidade for rapido, mantenha a lógica de muitos Stories por dia, feed diário, Reels diários, Lives estratégicas e Reels viral no fim de semana

8. VISUAL_PROMPT: Para cada post gere um prompt em ingles, especifico para busca de imagem de fundo. Cite luz, ambiente, composicao e paleta.

9. VARIEDADE OBRIGATÓRIA:
   - Reels educativos e de valor
   - Reels de bastidor ou prova
   - Stories com enquete, caixinha, resposta e continuação
   - Posts com prova social ou oferta quando fizer sentido
   - Carrossel com no máximo 3 slides
   - Conteúdo de oferta em no máximo 20% dos posts

10. REELS VIRAL:
   - Se viral_candidate for true, marque is_viral true
   - Esse Reels precisa ser diferente dos demais, com potencial de compartilhamento, polêmica leve, surpresa, transformação ou curiosidade forte
   - Se viral_candidate for false, is_viral deve ser false

11. HASHTAGS ESPECÍFICAS:
   - Use hashtags do nicho do cliente
   - Não use hashtags genéricas demais como principal
   - Retorne em string única separada por espaços

12. ESTRUTURA:
   - Mantenha exatamente os day_number e slot_index fornecidos
   - Não invente slots extras
   - O tipo de conteúdo já está definido no planejamento e não deve ser trocado

PLANEJAMENTO FIXO DESTA SEMANA:
${schedule}

Retorne APENAS JSON válido, sem markdown, neste formato:
{
  "days": [
    {
      "day_number": 1,
      "posts": [
        {
          "slot_index": 0,
          "topic": "titulo especifico",
          "script": "roteiro completo",
          "hashtags": "#tag1 #tag2",
          "visual_prompt": "prompt in english",
          "is_viral": false
        }
      ]
    }
  ]
}
`;

  return strategyPrompt.trim();
}

function buildWeekPromptV3(
  business: BusinessProfile,
  weekIndex: number,
  year: number,
  month: number,
  daysInMonth: number,
  weekDays: PlannedDay[],
) {
  const specialDates = weekDays
    .filter((day) => day.holiday_title)
    .map((day) => {
      const phaseLabel =
        day.holiday_phase === "anticipacao"
          ? "antecipacao"
          : day.holiday_phase === "encerramento"
            ? "encerramento"
            : "no dia";

      return `Dia ${day.day_number} | ${day.holiday_title} | fase ${phaseLabel} | prioridade ${day.holiday_priority || "secondary"} | orientacao ${day.holiday_guidance || "Conecte a data ao negocio com naturalidade."}`;
    })
    .join("\n");
  const schedule = weekDays
    .map((day) => {
      const slots = day.posts
        .map(
          (post) =>
            `id ${post.id} | slot_index ${post.slot_index} | horario ${post.time} | tipo ${getPublicationType(post)} | content_type ${post.content_type} | subtipo ${post.subtype} | estilo_id ${post.style_id || "na"} | estilo_nome ${post.style_label || "na"} | conectado_com_slot_index ${post.connected_to_slot_index ?? "null"} | viral_candidate ${post.is_viral_candidate ? "true" : "false"}${post.platform_tip ? ` | dica_plataforma ${post.platform_tip}` : ""}`,
        )
        .join("\n");

      return `Dia ${day.day_number} | tema_base ${day.focus_theme} | pilar ${day.content_pillar} | formato_prioritario ${day.primary_format} | subtipo_prioritario ${day.primary_subtype} | janela_prioritaria ${day.posting_window} | story_interacao ${day.story_interaction}${day.holiday_title ? ` | data_especial ${day.holiday_title} | fase_data ${day.holiday_phase} | orientacao_data ${day.holiday_guidance}` : ""}:\n${slots}`;
    })
    .join("\n\n");

  return `
Voce e o estrategista de conteudo do sistema Cresce. Gere o calendario editorial semanal que alimenta o calendario mensal do Instagram.

DADOS DO USUARIO:
- nome: ${business.business_name}
- nicho: ${business.niche}
- publico_alvo: ${business.target_audience}
- objetivo_principal: ${business.main_goal}
- tom_de_voz: ${business.communication_style}
- plataformas_ativas: ${business.platforms}
- mes: ${MONTH_NAMES[month - 1]} de ${year}
- semana_atual: ${weekIndex + 1}
- dias_do_mes: ${daysInMonth}
- o_que_o_cliente_quer_conquistar: ${business.brand_description}
- diferenciais_da_marca: ${business.unique_value || "nao informado"}
- concorrentes_ou_referencias: ${business.competitors || "nao informado"}

BANCO DE ESTILOS DISPONIVEIS:
${getStyleBankPrompt()}

DATAS ESPECIAIS DESTA SEMANA:
${specialDates || "Nenhuma data especial nesta semana."}

REGRAS INEGOCIAVEIS:
1. Use exatamente os slots e horarios do planejamento fixo.
2. Nunca troque o tipo do slot nem o estilo_id ja planejado.
3. Nunca repita o mesmo tema em dias consecutivos.
4. Nunca repita o mesmo CTA no mesmo dia.
5. Nunca use asteriscos.
6. Nunca use aspas para destacar palavras.
7. Escreva em portugues do Brasil com acentuacao correta.
8. Nunca use emojis.
9. Nunca crie Lives.
10. Nunca sugira gravacao no horario de almoco. Almoco pode ser horario de publicacao.
11. Se houver dica_plataforma no slot, respeite essa orientacao no conteudo.
12. Nunca use o nome do tema_base literalmente dentro da fala do responsavel no roteiro. Transforme o tema em contexto real de conversa, como alguem real falando, e nunca como um template.
13. Nunca gere conteudo generico. A data comemorativa e so o gancho. O negocio, o nicho, os produtos, os servicos e os diferenciais da marca precisam ser o protagonista do conteudo.
14. Se existir data_especial no dia, adapte o conteudo ao nicho do cliente. Nunca escreva parabens generico, mensagem pronta ou texto que serviria para qualquer empresa.
15. Em datas especiais, o gancho emocional vem primeiro e a oferta vem depois, de forma organica.
16. Se a data especial for feriado nacional, voce pode humanizar equipe, bastidores, rotina e descanso da marca.
17. Em datas primarias, trate antecipacao, dia e encerramento como capitulos diferentes da mesma campanha, evitando repetir angulo ou CTA.
18. Nunca repita o mesmo formato no mesmo dia sem proposito. Se um story anterior abriu enquete ou caixinha, o proximo story deve responder, aprofundar ou mostrar resultado.
19. Cada post do dia deve cumprir uma funcao diferente na jornada do seguidor: manha para ativacao, curiosidade ou conexao emocional; meio-dia para aprofundamento, resposta ou bastidor; tarde ou noite para conversao, reflexao ou CTA forte.
20. O objetivo declarado pelo usuario e o motor principal do calendario. Cada conteudo precisa ajudar esse objetivo de forma clara.
21. Antes de definir cada post, valide mentalmente: isso serve ao objetivo, esta especifico, faz sentido na sequencia do dia e pode gerar resultado real?

REGRAS DE ESTILO E CONEXAO:
1. Cada slot ja vem com um estilo_id obrigatorio. O conteudo precisa seguir fielmente o estilo descrito no banco.
2. Nenhum estilo pode parecer generico. O titulo precisa comunicar o assunto real e o angulo do dia.
3. Quando um slot vier com estilo_id H04 ou H05, o proximo HISTORY do mesmo dia com estilo_id H14 deve ser continuacao direta daquela caixinha.
4. Se existir conectado_com_slot_index, use o campo conectado_com no JSON final apontando para o id do post relacionado no planejamento.
5. O H14 nunca pode parecer um story novo. Ele deve soar como continuidade imediata da conversa e comecar direto na resposta, sem dizer que abriu uma caixinha.

REGRAS DOS STORIES:
1. Se slot_index 0 acontecer antes das 10h, o primeiro Story do dia deve ser sempre um bom dia natural, com o rosto do responsavel, comentando o contexto do dia e convidando a acompanhar os proximos stories. Nao use caixinha nem enquete nesse momento.
2. H04 e H05 devem seguir esta ordem interna: STORY 1 abre a caixinha, STORY 2 avisa que vai responder no proximo story, STORY 3 orienta a responder a primeira pergunta, DICAS - Continuacao orienta a seguir respondendo.
3. O slot seguinte a H04 ou H05 deve ser H14 e continuar a conversa da caixinha aberta antes.
4. H06 e H07 devem abrir uma enquete e seguir a mesma logica de continuidade no proprio script.
5. A partir do STORY 3, nao escreva roteiro palavra por palavra. Apenas instrua o criador sobre como responder com naturalidade.
6. Em todo story com caixinha ou enquete, inclua esta dica exata no final:
Se ninguem responder, voce mesmo pode fazer a pergunta e responder. Isso gera conteudo real e nao ha nada de errado nisso.
7. A pergunta da caixinha (H04, H05) ou da enquete (H06, H07) deve ser curta, coloquial e facil de responder. Nunca use o nome do tema como pergunta. A pergunta deve ser algo que o publico-alvo desse nicho responderia de verdade. Exemplos do formato correto: Voce ja tentou X? Qual e sua maior dificuldade com Y? Ja aconteceu isso com voce? Voce prefere A ou B? Adapte sempre ao nicho e ao publico-alvo do cliente.
8. O H14 nunca comeca com eu abri uma caixinha. Ele comeca direto respondendo a primeira pergunta recebida, como se a conversa ja estivesse em andamento.

REGRAS DOS REELS:
1. O roteiro deve ficar dentro do passo a passo.
2. Estrutura obrigatoria:
CENA 1
PASSO A PASSO:
1. Abra a camera e grave na vertical.
2. Nos 3 primeiros segundos, fale este gancho: [gancho]
3. Olhe direto para a camera.

CENA 2
PASSO A PASSO:
1. Em seguida fale: [roteiro completo]
2. Mostre um detalhe real, tela, ambiente, produto ou atendimento.
3. Mantenha cortes curtos.

CTA FINAL
PASSO A PASSO:
1. Feche dizendo: [cta]
2. Na edicao: cortes rapidos, legenda e musica popular no momento da gravacao.
3. Feche com a dica exata: Edite com cortes rapidos, adicione legenda e escolha uma musica popular no momento em que voce esta gravando.
4. O gancho dos 3 primeiros segundos deve ser especifico para o nicho e o publico-alvo do cliente.
5. Se is_viral_candidate for true, aumente impacto emocional, contraste, surpresa ou transformacao no roteiro, sem perder conexao com o nicho do cliente.

REGRAS DO FEED:
1. FEED_CARROSSEL deve ter de 3 a 5 slides, em ordem, sem pular numero.
2. No slide 1 inclua uma capa com titulo forte e Passe para o lado no rodape.
3. Do slide 2 em diante, entregue conteudo direto, especifico para o nicho e facil de aplicar.
4. O ultimo slide deve ter CTA claro e direto.
5. FEED_FOTO precisa entregar legenda pronta para copiar e colar, com 150 a 250 caracteres, CTA no final e descricao da imagem ideal baseada no nicho do cliente.

PLANEJAMENTO FIXO DESTA SEMANA:
${schedule}

Retorne APENAS JSON valido, sem markdown, neste formato:
{
  "days": [
    {
      "day_number": 1,
      "posts": [
        {
          "slot_index": 0,
          "horario": "08:45",
          "tipo": "HISTORY",
          "estilo_id": "H04",
          "titulo": "Titulo criativo e especifico",
          "topic": "Titulo criativo e especifico",
          "roteiro_resumido": "Resumo em 1 linha para o card do calendario",
          "conectado_com": null,
          "cta": "Chamada para acao especifica e natural",
          "legenda": null,
          "slides": null,
          "script": "Roteiro completo em formato executavel",
          "hashtags": "#tag1 #tag2",
          "visual_prompt": "prompt in english",
          "is_viral": false
        }
      ]
    }
  ]
}
`.trim();
}

function sanitizeGeneratedText(value: string) {
  return (value || "")
    .replace(/\*/g, "")
    .replace(/[“”"]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeGeneratedContentText(value: string) {
  return (value || "")
    .replace(/\*/g, "")
    .replace(/[\u201C\u201D"]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeOptionalContentText(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return sanitizeGeneratedContentText(value);
}

function sanitizeGeneratedSlides(
  value: unknown,
  fallback: Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }> | null,
) {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  const normalized = value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const numero =
        typeof (item as { numero?: unknown }).numero === "number"
          ? Number((item as { numero: number }).numero)
          : index + 1;
      const tipo = sanitizeOptionalContentText(
        (item as { tipo?: unknown }).tipo,
      );
      const textoPrincipal = sanitizeOptionalContentText(
        (item as { texto_principal?: unknown }).texto_principal,
      );
      const textoSecundario = sanitizeOptionalContentText(
        (item as { texto_secundario?: unknown }).texto_secundario,
      );

      if (!textoPrincipal) {
        return null;
      }

      return {
        numero,
        tipo: tipo || (index === 0 ? "capa" : "conteudo"),
        texto_principal: textoPrincipal,
        texto_secundario: textoSecundario || undefined,
      };
    })
    .filter(Boolean) as Array<{
    numero: number;
    tipo: string;
    texto_principal: string;
    texto_secundario?: string;
  }>;

  return normalized.length > 0 ? normalized : fallback;
}

async function generateWeekWithAI(
  business: BusinessProfile,
  weekIndex: number,
  year: number,
  month: number,
  daysInMonth: number,
  weekDays: PlannedDay[],
) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY nao configurada");
  }

  const prompt = buildWeekPromptV3(
    business,
    weekIndex,
    year,
    month,
    daysInMonth,
    weekDays,
  );

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: CONTENT_GENERATION_SYSTEM_PROMPT,
    prompt,
    temperature: 0.8,
    maxOutputTokens: 8000,
  });

  return extractJson(text) as { days?: Array<{ day_number: number; posts?: GeneratedPost[] }> };
}

function mergeWeekPosts(
  business: BusinessProfile,
  year: number,
  weekDays: PlannedDay[],
  aiResult?: { days?: Array<{ day_number: number; posts?: GeneratedPost[] }> },
): StrategyCalendarDay[] {
  return weekDays.map((day) => {
    const aiDay = aiResult?.days?.find(
      (item) => Number(item.day_number) === day.day_number,
    );

    const posts = day.posts.map((seed) => {
      const fallback = buildFallbackPost(business, day, seed, year);
      const aiPost = aiDay?.posts?.find(
        (item) => Number(item.slot_index) === seed.slot_index,
      );
      const connectedSeed =
        seed.connected_to_slot_index !== null &&
        seed.connected_to_slot_index !== undefined
          ? day.posts.find((item) => item.slot_index === seed.connected_to_slot_index)
          : null;
      const fallbackConnectedId = connectedSeed?.id || null;
      const rawConnectedValue =
        typeof aiPost?.conectado_com === "string"
          ? aiPost.conectado_com.trim()
          : "";
      const resolvedConnectedId =
        rawConnectedValue && day.posts.some((item) => item.id === rawConnectedValue)
          ? rawConnectedValue
          : /^slot:(\d+)$/.test(rawConnectedValue)
            ? day.posts.find(
                (item) =>
                  item.slot_index === Number(rawConnectedValue.replace("slot:", "")),
              )?.id || fallbackConnectedId
            : /^\d+$/.test(rawConnectedValue)
              ? day.posts.find(
                  (item) => item.slot_index === Number(rawConnectedValue),
                )?.id || fallbackConnectedId
              : fallbackConnectedId;

      const topic =
        typeof aiPost?.titulo === "string" && aiPost.titulo.trim()
          ? sanitizeGeneratedContentText(aiPost.titulo)
          : typeof aiPost?.topic === "string" && aiPost.topic.trim()
            ? sanitizeGeneratedContentText(aiPost.topic)
          : fallback.topic;

      const script =
        typeof aiPost?.script === "string" && aiPost.script.trim()
          ? sanitizeGeneratedContentText(aiPost.script)
          : fallback.script;

      const visual_prompt =
        typeof aiPost?.visual_prompt === "string" && aiPost.visual_prompt.trim()
          ? aiPost.visual_prompt.trim()
          : fallback.visual_prompt;
      const summary =
        sanitizeOptionalContentText(aiPost?.roteiro_resumido) ||
        fallback.roteiro_resumido ||
        buildSummaryFromSeed(topic, seed);
      const cta =
        sanitizeOptionalContentText(aiPost?.cta) ||
        fallback.cta ||
        buildCtaFromSeed(business, seed);
      const legenda =
        sanitizeOptionalContentText(aiPost?.legenda) || fallback.legenda || null;
      const slides = sanitizeGeneratedSlides(aiPost?.slides, fallback.slides || null);

      return {
        id: seed.id,
        slot_index: seed.slot_index,
        time: seed.time,
        content_type: seed.content_type,
        subtype: seed.subtype,
        style_id: seed.style_id,
        style_label: seed.style_label,
        summary,
        connected_to: resolvedConnectedId,
        cta,
        legenda,
        slides,
        topic: sanitizeGeneratedContentText(topic),
        script: sanitizeGeneratedContentText(script),
        hashtags: normalizeHashtags(aiPost?.hashtags, business.niche),
        visual_prompt,
        is_viral: seed.is_viral_candidate,
        completed: false,
        platform_tip: seed.platform_tip || aiPost?.platform_tip || null,
      };
    });

    return {
      day_number: day.day_number,
      posts,
    };
  });
}

function buildTopicFingerprint(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(
      /^(caixinha do dia|enquete do dia|reels de dica rapida|reels de erro comum|reels de bastidor|carrossel educativo|carrossel comparativo|conteudo do dia|prova social do dia|live pratica)\s*:\s*/g,
      "",
    )
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildScriptFingerprint(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function areTopicsTooSimilar(currentTopic: string, previousTopic: string) {
  const current = buildTopicFingerprint(currentTopic);
  const previous = buildTopicFingerprint(previousTopic);

  if (!current || !previous) return false;
  if (current === previous) return true;

  return current.length > 24 && (current.includes(previous) || previous.includes(current));
}

function ensureGeneratedDayVariety(
  business: BusinessProfile,
  year: number,
  plannedDays: PlannedDay[],
  generatedDays: StrategyCalendarDay[],
) {
  const dayPlanMap = new Map(plannedDays.map((day) => [day.day_number, day]));
  const sortedDays = [...generatedDays].sort((a, b) => a.day_number - b.day_number);
  const adjustedDays: StrategyCalendarDay[] = [];

  sortedDays.forEach((day) => {
    const dayPlan = dayPlanMap.get(day.day_number);

    if (!dayPlan) {
      adjustedDays.push(day);
      return;
    }

    const previousDay = adjustedDays[adjustedDays.length - 1];
    const previousTopics = previousDay?.posts.map((post) => post.topic) || [];
    const previousScripts =
      previousDay?.posts.map((post) => buildScriptFingerprint(post.script)) || [];
    const seenCurrentTopics = new Set<string>();

    const posts = day.posts.map((post) => {
      const seed = dayPlan.posts.find((item) => item.slot_index === post.slot_index);

      if (!seed) {
        return post;
      }

      const normalizedTopic = normalizeText(post.topic).toLowerCase();
      const scriptFingerprint = buildScriptFingerprint(post.script);
      const repeatsPreviousDay =
        previousTopics.some((previousTopic) =>
          areTopicsTooSimilar(post.topic, previousTopic),
        ) || previousScripts.some((previousScript) => previousScript === scriptFingerprint);
      const repeatsWithinDay =
        Boolean(normalizedTopic) && seenCurrentTopics.has(normalizedTopic);
      const wrongFormat = normalizeText(post.content_type) !== normalizeText(seed.content_type);

      if (repeatsPreviousDay || repeatsWithinDay || wrongFormat) {
        const fallback = buildFallbackPost(business, dayPlan, seed, year);
        const replacement: StrategyCalendarPost = {
          id: post.id,
          slot_index: seed.slot_index,
          time: seed.time,
          content_type: seed.content_type,
          subtype: seed.subtype,
          style_id: seed.style_id,
          style_label: seed.style_label,
          summary:
            sanitizeOptionalContentText(fallback.roteiro_resumido) ||
            buildSummaryFromSeed(fallback.topic, seed),
          connected_to:
            seed.connected_to_slot_index !== null &&
            seed.connected_to_slot_index !== undefined
              ? day.posts.find((item) => item.slot_index === seed.connected_to_slot_index)
                  ?.id || null
              : null,
          cta: sanitizeOptionalContentText(fallback.cta) || buildCtaFromSeed(business, seed),
          legenda: sanitizeOptionalContentText(fallback.legenda) || null,
          slides: sanitizeGeneratedSlides(fallback.slides, fallback.slides || null),
          topic: sanitizeGeneratedContentText(fallback.topic),
          script: sanitizeGeneratedContentText(fallback.script),
          hashtags: fallback.hashtags,
          visual_prompt: fallback.visual_prompt,
          is_viral: seed.is_viral_candidate,
          completed: false,
          platform_tip: seed.platform_tip || fallback.platform_tip || null,
        };

        seenCurrentTopics.add(normalizeText(replacement.topic).toLowerCase());
        return replacement;
      }

      seenCurrentTopics.add(normalizedTopic);

      return {
        ...post,
        time: seed.time,
        content_type: seed.content_type,
        subtype: seed.subtype,
        style_id: seed.style_id,
        style_label: seed.style_label,
        summary:
          post.summary ||
          buildSummaryFromSeed(post.topic || seed.style_label || "", seed),
        connected_to:
          post.connected_to ||
          (seed.connected_to_slot_index !== null &&
          seed.connected_to_slot_index !== undefined
            ? day.posts.find((item) => item.slot_index === seed.connected_to_slot_index)
                ?.id || null
            : null),
        cta: post.cta || buildCtaFromSeed(business, seed),
        legenda:
          post.legenda ||
          buildCaptionFromSeed(business, post.topic || buildTopicFromSeed(business, dayPlan, seed, year), seed),
        slides:
          post.slides ||
          buildSlidesFromSeed(
            business,
            post.topic || buildTopicFromSeed(business, dayPlan, seed, year),
            seed,
          ),
        is_viral: seed.is_viral_candidate,
        platform_tip: seed.platform_tip || post.platform_tip || null,
      };
    });

    adjustedDays.push({
      day_number: day.day_number,
      posts,
    });
  });

  return adjustedDays;
}

function buildStrategyMetadata(
  business: BusinessProfile,
  month: number,
  year: number,
  plannedDays: number,
) {
  const holidayMoments = buildHolidayMoments(
    business,
    year,
    month,
    new Date(year, month, 0).getDate(),
  );
  const seasonalSummary = holidayMoments.length
    ? ` Inclui ${holidayMoments.length} ganchos sazonais relevantes no mes.`
    : "";

  return {
    title: `${MONTH_NAMES[month - 1]} de Conteudo para ${business.business_name}`,
    summary: `Planejamento personalizado para ${plannedDays} dias ativos, focado em ${getGoalLabel(business.main_goal)} com conteudos especificos para ${business.niche}.${seasonalSummary}`,
    month,
    year,
  };
}

export async function POST(req: Request) {
  try {
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

    const body = (await req.json()) as StrategyRequestOverrides & {
      month?: number;
      year?: number;
    };
    const derivedStartDate =
      typeof body.inicio_mes === "string" && body.inicio_mes.trim()
        ? new Date(body.inicio_mes)
        : null;
    const month =
      typeof body.month === "number" && body.month >= 1 && body.month <= 12
        ? body.month
        : derivedStartDate && !Number.isNaN(derivedStartDate.getTime())
          ? derivedStartDate.getMonth() + 1
          : null;
    const year =
      typeof body.year === "number" && body.year >= 2000
        ? body.year
        : derivedStartDate && !Number.isNaN(derivedStartDate.getTime())
          ? derivedStartDate.getFullYear()
          : null;

    if (!month || !year) {
      return new Response(
        JSON.stringify({ error: "Mes e ano sao obrigatorios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("*, created_at")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const planningPreferences = buildPlanningPreferences(
      body,
      business.created_at ?? null,
    );

    const businessProfile: BusinessProfile = {
      id: business.id,
      business_name:
        (typeof body.nome === "string" && body.nome.trim()) ||
        business.business_name ||
        "Negocio",
      niche:
        (typeof body.nicho === "string" && body.nicho.trim()) ||
        business.niche ||
        "negocio local",
      target_audience:
        (typeof body.publico_alvo === "string" && body.publico_alvo.trim()) ||
        business.target_audience ||
        "clientes da regiao",
      main_goal:
        (typeof body.objetivo_principal === "string" &&
          body.objetivo_principal.trim()) ||
        business.main_goal ||
        "identidade",
      platforms: business.platforms || "instagram",
      communication_style:
        (typeof body.tom_de_voz === "string" && body.tom_de_voz.trim()) ||
        business.communication_style ||
        "casual",
      growth_speed: (business.growth_speed || "moderado") as GrowthSpeed,
      brand_description:
        business.brand_description || "conquistar mais resultado com conteudo",
      responsible_name: business.responsible_name,
      instagram_handle: business.instagram_handle,
      brand_colors: business.brand_colors,
      unique_value: business.unique_value,
      competitors: business.competitors,
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const dayWindow = getInitialCycleWindow(
      planningPreferences.startDate,
      year,
      month,
      daysInMonth,
    );
    const plannedDays = buildPlanForMonth(
      businessProfile,
      year,
      month,
      daysInMonth,
      dayWindow,
      planningPreferences,
    );
    const weeklyBatches = splitDaysByWeek(year, month, plannedDays);

    const generatedDays: StrategyCalendarDay[] = [];

    for (const batch of weeklyBatches) {
      let aiResult:
        | { days?: Array<{ day_number: number; posts?: GeneratedPost[] }> }
        | undefined;

      try {
        aiResult = await generateWeekWithAI(
          businessProfile,
          batch.weekIndex,
          year,
          month,
          daysInMonth,
          batch.days,
        );
      } catch (error) {
        console.error(
          `Falha ao gerar semana ${batch.weekIndex + 1} com IA. Usando fallback.`,
          error,
        );
      }

      generatedDays.push(
        ...mergeWeekPosts(businessProfile, year, batch.days, aiResult),
      );
    }

    const finalDays = ensureGeneratedDayVariety(
      businessProfile,
      year,
      plannedDays,
      generatedDays,
    );

    const strategyData = buildStrategyMetadata(
      businessProfile,
      month,
      year,
      finalDays.length,
    );

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

    if (insertError) throw insertError;

    const daysData = finalDays.map((day) => {
      const firstPost = day.posts[0];

      return {
        strategy_id: strategy.id,
        user_id: user.id,
        day_number: day.day_number,
        content_type: firstPost.content_type,
        topic: firstPost.topic,
        caption_idea: firstPost.script,
        best_time: firstPost.time,
        hashtags: firstPost.hashtags,
        completed: false,
        posts: day.posts,
      };
    });

    const { error: daysError } = await supabase
      .from("strategy_days")
      .insert(daysData)
      .select();

    if (daysError) throw daysError;

    return new Response(
      JSON.stringify({
        success: true,
        strategy,
        daysCount: daysData.length,
        growthSpeed: businessProfile.growth_speed,
        usedAi: Boolean(process.env.GROQ_API_KEY),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Erro ao gerar estrategia:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Erro ao gerar estrategia",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
