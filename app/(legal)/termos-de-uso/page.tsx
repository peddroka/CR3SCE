import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY_ADDRESS,
  COMPANY_CNPJ,
  COMPANY_NAME,
  CONTACT_EMAIL,
  DPO_EMAIL,
  LAST_UPDATED,
  TERMS_OF_USE_VERSION,
} from "@/lib/lgpd/company";

export const metadata: Metadata = {
  title: "Termos de Uso | CR3SCE",
  description: "Regras de uso do CR3SCE, planos, pagamentos e cancelamento.",
};

export default function TermsOfUsePage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p className="text-sm">
        Versao {TERMS_OF_USE_VERSION} &middot; Ultima atualizacao:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Estes Termos de Uso (&quot;<strong>Termos</strong>&quot;) regulam o
        acesso e o uso do produto CR3SCE oferecido por{" "}
        <strong>{COMPANY_NAME}</strong>, CNPJ <strong>{COMPANY_CNPJ}</strong>,
        com sede em {COMPANY_ADDRESS}. Ao criar conta ou usar o servico voce
        declara ter lido, compreendido e concordado integralmente com estes
        Termos e com a{" "}
        <Link href="/politica-de-privacidade">Politica de Privacidade</Link>.
      </p>

      <h2>1. O que e o CR3SCE</h2>
      <p>
        O CR3SCE e uma plataforma online que oferece planejamento de conteudo
        para Instagram, geracao de calendarios editoriais, analise de perfil,
        sugestoes de imagens e assistente de IA. O servico e fornecido em
        modelo de assinatura mensal ou anual.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>
          Para usar o CR3SCE voce precisa ter no minimo <strong>18 anos</strong>{" "}
          e capacidade civil plena.
        </li>
        <li>
          Voce deve fornecer informacoes verdadeiras, atuais e completas, e
          manter os dados atualizados.
        </li>
        <li>
          Voce e o unico responsavel pela confidencialidade da sua senha.
          Avise imediatamente em caso de uso nao autorizado.
        </li>
        <li>
          Cada conta e individual e intransferivel. E proibido compartilhar
          acesso.
        </li>
      </ul>

      <h2>3. Planos, pagamento e renovacao</h2>
      <ul>
        <li>
          Os planos e precos vigentes estao descritos em nosso site.
          Pagamentos sao processados via Cakto.
        </li>
        <li>
          Assinaturas mensais sao renovadas automaticamente todo mes, e
          anuais a cada 12 meses, ate que voce cancele.
        </li>
        <li>
          Em caso de falha no pagamento, suspendemos o acesso ao conteudo
          pago ate a regularizacao.
        </li>
        <li>
          Eventuais reajustes serao comunicados com no minimo 30 dias de
          antecedencia.
        </li>
      </ul>

      <h2>4. Direito de arrependimento e cancelamento</h2>
      <ul>
        <li>
          Conforme o Art. 49 do Codigo de Defesa do Consumidor, voce pode
          desistir da contratacao em ate <strong>7 dias</strong> apos o
          pagamento e receber reembolso integral.
        </li>
        <li>
          Apos esse prazo, voce pode cancelar a renovacao a qualquer
          momento. O acesso permanece ativo ate o final do periodo ja pago.
          Nao ha reembolso proporcional de periodos parcialmente
          utilizados.
        </li>
      </ul>

      <h2>5. Uso aceitavel</h2>
      <p>Voce concorda em nao usar o servico para:</p>
      <ul>
        <li>Atividades ilicitas, fraudulentas ou que violem direitos de terceiros.</li>
        <li>Gerar conteudo que incite odio, violencia, discriminacao ou pratique assedio.</li>
        <li>Tentar contornar limites tecnicos, fazer engenharia reversa, escanear vulnerabilidades sem autorizacao ou interferir na operacao do servico.</li>
        <li>Coletar dados de terceiros sem base legal apropriada.</li>
        <li>Revender ou sublicenciar o servico sem autorizacao escrita.</li>
        <li>Publicar conteudo gerado pela IA como se fosse opiniao independente, sem revisao humana, em contextos sensiveis (saude, financeiro, juridico).</li>
      </ul>
      <p>
        Podemos suspender ou encerrar contas que descumpram estas regras,
        sem prejuizo de medidas legais cabiveis.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <ul>
        <li>
          <strong>Conteudo da plataforma:</strong> todo o software, design,
          marcas, logos, textos e elementos visuais do CR3SCE pertencem a{" "}
          {COMPANY_NAME} ou aos seus licenciantes.
        </li>
        <li>
          <strong>Seu conteudo:</strong> voce mantem todos os direitos sobre
          o conteudo que voce envia (prompts, screenshots, imagens). Voce
          nos concede licenca limitada, nao-exclusiva e revogavel para
          processar, exibir e armazenar esse conteudo apenas na medida
          necessaria para fornecer o servico.
        </li>
        <li>
          <strong>Conteudo gerado pela IA:</strong> o output do assistente e
          de uso livre, mas pode incluir trechos sob direitos de terceiros.
          Voce e responsavel por revisar antes de publicar.
        </li>
      </ul>

      <h2>7. Inteligencia artificial - avisos importantes</h2>
      <ul>
        <li>
          As respostas do assistente sao geradas por modelos de linguagem
          (LLMs) e <strong>podem conter erros, imprecisoes ou
          alucinacoes</strong>. Revise antes de publicar.
        </li>
        <li>
          O CR3SCE nao se responsabiliza por decisoes tomadas exclusivamente
          com base em output da IA. Use seu julgamento.
        </li>
        <li>
          Configuramos contratualmente que os provedores de IA <strong>nao
          usem seu conteudo para treinar modelos</strong>.
        </li>
      </ul>

      <h2>8. Disponibilidade do servico</h2>
      <p>
        Empenhamos esforcos razoaveis para manter o servico disponivel 24/7,
        mas nao garantimos disponibilidade ininterrupta. Manutencoes
        programadas serao comunicadas. Indisponibilidades causadas por
        forca maior, ataques ou problemas em terceiros (provedores de
        nuvem, IA, pagamento) nao geram dever de indenizar.
      </p>

      <h2>9. Limitacao de responsabilidade</h2>
      <p>
        Na maxima extensao permitida pela lei, a responsabilidade total do
        CR3SCE por danos relacionados ao servico fica limitada ao valor
        efetivamente pago por voce nos 12 meses anteriores ao evento que
        deu causa ao dano. Nao respondemos por danos indiretos, lucros
        cessantes ou perda de oportunidade.
      </p>

      <h2>10. Privacidade e dados pessoais</h2>
      <p>
        O tratamento de dados pessoais e regido pela nossa{" "}
        <Link href="/politica-de-privacidade">Politica de Privacidade</Link>,
        que faz parte destes Termos.
      </p>

      <h2>11. Alteracoes nos Termos</h2>
      <p>
        Podemos atualizar estes Termos. Mudancas materiais serao comunicadas
        no site e, quando aplicavel, por e-mail, com no minimo 15 dias de
        antecedencia. Continuar usando o servico apos o prazo significa
        aceitacao dos novos Termos. Se voce nao concordar, pode cancelar a
        conta antes da vigencia.
      </p>

      <h2>12. Lei aplicavel e foro</h2>
      <p>
        Estes Termos sao regidos pela legislacao brasileira. Para dirimir
        controversias, fica eleito o foro da Comarca de{" "}
        <strong>[CIDADE/UF]</strong>, com renuncia a qualquer outro, por
        mais privilegiado que seja, ressalvado o direito do consumidor de
        ajuizar no seu domicilio.
      </p>

      <h2>13. Contato</h2>
      <p>
        Suporte: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Privacidade / Encarregado:{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
        <br />
        Endereco: {COMPANY_ADDRESS}
      </p>
    </>
  );
}
