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
        Versão {TERMS_OF_USE_VERSION} &middot; Última atualização:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Estes Termos de Uso (&quot;<strong>Termos</strong>&quot;) regulam o
        acesso e o uso do produto CR3SCE oferecido por{" "}
        <strong>{COMPANY_NAME}</strong>, CNPJ <strong>{COMPANY_CNPJ}</strong>,
        com sede em {COMPANY_ADDRESS}. Ao criar conta ou usar o serviço você
        declara ter lido, compreendido e concordado integralmente com estes
        Termos e com a{" "}
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. O que é o CR3SCE</h2>
      <p>
        O CR3SCE é uma plataforma online que oferece planejamento de conteúdo
        para Instagram, geração de calendários editoriais, análise de perfil,
        sugestões de imagens e assistente de IA. O serviço é fornecido em
        modelo de assinatura mensal ou anual.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>
          Para usar o CR3SCE você precisa ter no mínimo <strong>18 anos</strong>{" "}
          e capacidade civil plena.
        </li>
        <li>
          Você deve fornecer informações verdadeiras, atuais e completas, e
          manter os dados atualizados.
        </li>
        <li>
          Você é o único responsável pela confidencialidade da sua senha.
          Avise imediatamente em caso de uso não autorizado.
        </li>
        <li>
          Cada conta é individual e intransferível. É proibido compartilhar
          acesso.
        </li>
      </ul>

      <h2>3. Planos, pagamento e renovação</h2>
      <ul>
        <li>
          Os planos e preços vigentes estão descritos em nosso site.
          Pagamentos são processados via Cakto.
        </li>
        <li>
          Assinaturas mensais são renovadas automaticamente todo mês, e
          anuais a cada 12 meses, até que você cancele.
        </li>
        <li>
          Em caso de falha no pagamento, suspendemos o acesso ao conteúdo
          pago até a regularização.
        </li>
        <li>
          Eventuais reajustes serão comunicados com no mínimo 30 dias de
          antecedência.
        </li>
      </ul>

      <h2>4. Direito de arrependimento e cancelamento</h2>
      <ul>
        <li>
          Conforme o Art. 49 do Código de Defesa do Consumidor, você pode
          desistir da contratação em até <strong>7 dias</strong> após o
          pagamento e receber reembolso integral.
        </li>
        <li>
          Após esse prazo, você pode cancelar a renovação a qualquer
          momento. O acesso permanece ativo até o final do período já pago.
          Não há reembolso proporcional de períodos parcialmente
          utilizados.
        </li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>Você concorda em não usar o serviço para:</p>
      <ul>
        <li>Atividades ilícitas, fraudulentas ou que violem direitos de terceiros.</li>
        <li>Gerar conteúdo que incite ódio, violência, discriminação ou pratique assédio.</li>
        <li>Tentar contornar limites técnicos, fazer engenharia reversa, escanear vulnerabilidades sem autorização ou interferir na operação do serviço.</li>
        <li>Coletar dados de terceiros sem base legal apropriada.</li>
        <li>Revender ou sublicenciar o serviço sem autorização escrita.</li>
        <li>Publicar conteúdo gerado pela IA como se fosse opinião independente, sem revisão humana, em contextos sensíveis (saúde, financeiro, jurídico).</li>
      </ul>
      <p>
        Podemos suspender ou encerrar contas que descumpram estas regras,
        sem prejuízo de medidas legais cabíveis.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <ul>
        <li>
          <strong>Conteúdo da plataforma:</strong> todo o software, design,
          marcas, logos, textos e elementos visuais do CR3SCE pertencem a{" "}
          {COMPANY_NAME} ou aos seus licenciantes.
        </li>
        <li>
          <strong>Seu conteúdo:</strong> você mantém todos os direitos sobre
          o conteúdo que você envia (prompts, screenshots, imagens). Você
          nos concede licença limitada, não-exclusiva e revogável para
          processar, exibir e armazenar esse conteúdo apenas na medida
          necessária para fornecer o serviço.
        </li>
        <li>
          <strong>Conteúdo gerado pela IA:</strong> o output do assistente é
          de uso livre, mas pode incluir trechos sob direitos de terceiros.
          Você é responsável por revisar antes de publicar.
        </li>
      </ul>

      <h2>7. Inteligência artificial - avisos importantes</h2>
      <ul>
        <li>
          As respostas do assistente são geradas por modelos de linguagem
          (LLMs) e <strong>podem conter erros, imprecisões ou
          alucinações</strong>. Revise antes de publicar.
        </li>
        <li>
          O CR3SCE não se responsabiliza por decisões tomadas exclusivamente
          com base em output da IA. Use seu julgamento.
        </li>
        <li>
          Configuramos contratualmente que os provedores de IA <strong>não
          usem seu conteúdo para treinar modelos</strong>.
        </li>
      </ul>

      <h2>8. Disponibilidade do serviço</h2>
      <p>
        Empenhamos esforços razoáveis para manter o serviço disponível 24/7,
        mas não garantimos disponibilidade ininterrupta. Manutenções
        programadas serão comunicadas. Indisponibilidades causadas por
        força maior, ataques ou problemas em terceiros (provedores de
        nuvem, IA, pagamento) não geram dever de indenizar.
      </p>

      <h2>9. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, a responsabilidade total do
        CR3SCE por danos relacionados ao serviço fica limitada ao valor
        efetivamente pago por você nos 12 meses anteriores ao evento que
        deu causa ao dano. Não respondemos por danos indiretos, lucros
        cessantes ou perda de oportunidade.
      </p>

      <h2>10. Privacidade e dados pessoais</h2>
      <p>
        O tratamento de dados pessoais é regido pela nossa{" "}
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>,
        que faz parte destes Termos.
      </p>

      <h2>11. Alterações nos Termos</h2>
      <p>
        Podemos atualizar estes Termos. Mudanças materiais serão comunicadas
        no site e, quando aplicável, por e-mail, com no mínimo 15 dias de
        antecedência. Continuar usando o serviço após o prazo significa
        aceitação dos novos Termos. Se você não concordar, pode cancelar a
        conta antes da vigência.
      </p>

      <h2>12. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pela legislação brasileira. Para dirimir
        controvérsias, fica eleito o foro da Comarca de{" "}
        <strong>[CIDADE/UF]</strong>, com renúncia a qualquer outro, por
        mais privilegiado que seja, ressalvado o direito do consumidor de
        ajuizar no seu domicílio.
      </p>

      <h2>13. Contato</h2>
      <p>
        Suporte: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Privacidade / Encarregado:{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
        <br />
        Endereço: {COMPANY_ADDRESS}
      </p>
    </>
  );
}
