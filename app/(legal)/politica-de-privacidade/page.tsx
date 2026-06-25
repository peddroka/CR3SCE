import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY_ADDRESS,
  COMPANY_CNPJ,
  COMPANY_NAME,
  DPO_EMAIL,
  LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
} from "@/lib/lgpd/company";

export const metadata: Metadata = {
  title: "Política de Privacidade | CR3SCE",
  description:
    "Como o CR3SCE coleta, usa, compartilha e protege seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p className="text-sm">
        Versão {PRIVACY_POLICY_VERSION} &middot; Última atualização:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Esta Política de Privacidade descreve como{" "}
        <strong>{COMPANY_NAME}</strong>, inscrita no CNPJ{" "}
        <strong>{COMPANY_CNPJ}</strong>, com sede em {COMPANY_ADDRESS}{" "}
        (&quot;<strong>CR3SCE</strong>&quot;, &quot;<strong>nos</strong>&quot;
        ou &quot;<strong>nosso</strong>&quot;), trata os dados pessoais dos
        usuários (&quot;<strong>você</strong>&quot; ou &quot;
        <strong>titular</strong>&quot;) do nosso produto, em conformidade com a
        Lei Geral de Proteção de Dados Pessoais (Lei n. 13.709/2018 - LGPD) e
        demais legislações aplicáveis.
      </p>

      <h2>1. Quem é o controlador dos seus dados</h2>
      <p>
        O controlador dos dados pessoais tratados nesta plataforma é{" "}
        <strong>{COMPANY_NAME}</strong>, CNPJ {COMPANY_CNPJ}, com sede em{" "}
        {COMPANY_ADDRESS}. Para qualquer assunto relacionado à privacidade,
        você pode falar com nosso Encarregado pelo Tratamento de Dados (DPO)
        pelo e-mail{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
      </p>

      <h2>2. Quais dados pessoais coletamos</h2>
      <h3>2.1. Dados que você nos fornece diretamente</h3>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, sobrenome, endereço de e-mail e
          senha (armazenada em formato seguro de hash).
        </li>
        <li>
          <strong>Onboarding e perfil do negócio:</strong> nome do negócio,
          nicho de atuação, descrição do público-alvo, nome do responsável
          pelo negócio, usuário do Instagram (@), estilo de comunicação,
          tom de voz e descrição da marca.
        </li>
        <li>
          <strong>Capturas de tela e imagens de bio:</strong> imagens enviadas
          para análise do perfil, armazenadas em bucket privado do Supabase
          Storage.
        </li>
        <li>
          <strong>Dados de evolução:</strong> número de seguidores, média de
          visualizações, equipamentos disponíveis e investimento mensal
          declarado.
        </li>
        <li>
          <strong>Interações com a IA:</strong> mensagens enviadas ao
          assistente de conteúdo e parâmetros usados em geração de imagens.
        </li>
        <li>
          <strong>Pagamento:</strong> e-mail e identificador do pedido
          fornecidos por nosso processador de pagamentos. <strong>Não
          armazenamos dados de cartão de crédito</strong>; essas informações
          são tratadas exclusivamente pela Cakto.
        </li>
      </ul>

      <h3>2.2. Dados coletados automaticamente</h3>
      <ul>
        <li>
          <strong>Identificadores de sessão:</strong> cookies essenciais de
          autenticação para manter você logado.
        </li>
        <li>
          <strong>Dados técnicos:</strong> endereço IP, tipo e versão do
          navegador, sistema operacional, páginas visitadas e timestamps,
          quando registramos em logs de auditoria.
        </li>
        <li>
          <strong>Analytics e marketing (mediante consentimento):</strong>{" "}
          métricas agregadas de uso, eventos de campanha. Consulte a{" "}
          <Link href="/politica-de-cookies">Política de Cookies</Link> para
          detalhes.
        </li>
      </ul>

      <h2>3. Para que usamos seus dados e com que base legal</h2>
      <p>
        Toda operação com dados pessoais é baseada em uma das hipóteses do
        Art. 7 da LGPD. As principais são:
      </p>
      <div className="-mx-2 overflow-x-auto px-2 [&_table]:min-w-[34rem]">
      <table>
        <thead>
          <tr>
            <th>Finalidade</th>
            <th>Dados envolvidos</th>
            <th>Base legal (LGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Criar e manter sua conta, autenticar acesso</td>
            <td>Nome, e-mail, senha (hash)</td>
            <td>Execução de contrato (Art. 7, V)</td>
          </tr>
          <tr>
            <td>
              Gerar planejamento de conteúdo, score de perfil, calendário e
              imagens
            </td>
            <td>
              Perfil do negocio, dados de Instagram, prompts de IA,
              screenshots
            </td>
            <td>Execução de contrato (Art. 7, V)</td>
          </tr>
          <tr>
            <td>Processar pagamento e liberar acesso pago</td>
            <td>E-mail, ID do pedido</td>
            <td>
              Execução de contrato (Art. 7, V) e cumprimento de obrigação
              legal/fiscal (Art. 7, II)
            </td>
          </tr>
          <tr>
            <td>Detectar fraudes, abusos e proteger o serviço</td>
            <td>IP, user agent, logs de auditoria</td>
            <td>Legítimo interesse (Art. 7, IX)</td>
          </tr>
          <tr>
            <td>Enviar comunicados de marketing</td>
            <td>E-mail, nome</td>
            <td>Consentimento (Art. 7, I) - opt-in revogável</td>
          </tr>
          <tr>
            <td>Cookies de analytics e marketing</td>
            <td>Identificadores de dispositivo, eventos</td>
            <td>Consentimento (Art. 7, I)</td>
          </tr>
          <tr>
            <td>Cumprir requisições legais e regulatórias</td>
            <td>Qualquer dado solicitado</td>
            <td>Obrigação legal (Art. 7, II)</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h2>4. Com quem compartilhamos seus dados</h2>
      <p>
        Compartilhamos dados estritamente com os operadores listados abaixo,
        que processam os dados em nosso nome sob contrato e instruções
        específicas:
      </p>
      <ul>
        <li>
          <strong>Supabase (Supabase Inc., EUA)</strong> - banco de dados,
          autenticação e armazenamento de arquivos. Recebe: dados de cadastro,
          perfil, conteúdo gerado e arquivos enviados.
        </li>
        <li>
          <strong>Groq (Groq Inc., EUA)</strong> - inferência de IA para
          geração de texto. Recebe: mensagens enviadas ao assistente e
          contexto resumido do negócio. <strong>Configuramos para não usar
          seu conteúdo em treinamento.</strong>
        </li>
        <li>
          <strong>Cakto (Cakto Pagamentos, Brasil)</strong> - processamento de
          pagamentos. Recebe: e-mail, valor e identificador do pedido.
        </li>
        <li>
          <strong>Provedores de hospedagem e CDN</strong> - servidores onde a
          aplicação roda. Recebem dados de requisição (IP, páginas
          acessadas).
        </li>
      </ul>
      <p>
        Também podemos compartilhar dados quando exigido por autoridade
        competente ou por determinação judicial. Não vendemos seus dados
        pessoais sob nenhuma hipótese.
      </p>

      <h2>5. Transferência internacional de dados</h2>
      <p>
        Alguns de nossos operadores (Supabase, Groq) estão localizados fora
        do Brasil. As transferências internacionais ocorrem com base em
        garantias contratuais específicas (cláusulas contratuais e padrões
        equivalentes aos exigidos pela LGPD, Art. 33), assegurando o mesmo
        nível de proteção.
      </p>

      <h2>6. Por quanto tempo guardamos seus dados</h2>
      <ul>
        <li>
          <strong>Dados de conta e perfil:</strong> enquanto a conta estiver
          ativa.
        </li>
        <li>
          <strong>Dados de geração de conteúdo:</strong> enquanto a conta
          estiver ativa, ou até você solicitar a exclusão.
        </li>
        <li>
          <strong>Dados fiscais de pagamento:</strong> 5 anos após a
          transação, conforme prazo legal (Art. 173 CTN).
        </li>
        <li>
          <strong>Logs de auditoria:</strong> 6 anos, alinhado ao prazo
          prescricional cabível.
        </li>
        <li>
          <strong>Após solicitação de exclusão:</strong> os dados são
          excluídos em até 30 dias, ressalvadas as hipóteses do Art. 16 LGPD
          (cumprimento de obrigação legal, estudo por órgão de pesquisa com
          anonimização, exercício regular de direitos).
        </li>
      </ul>

      <h2>7. Seus direitos como titular (Art. 18 LGPD)</h2>
      <p>Você tem direito a, a qualquer momento:</p>
      <ul>
        <li>
          <strong>Confirmar</strong> a existência de tratamento dos seus
          dados.
        </li>
        <li>
          <strong>Acessar</strong> seus dados (exportação em formato JSON
          disponível em <Link href="/dashboard/privacidade">Privacidade</Link>{" "}
          dentro da sua conta).
        </li>
        <li>
          <strong>Corrigir</strong> dados incompletos, inexatos ou
          desatualizados (via{" "}
          <Link href="/dashboard/settings">Configurações</Link>).
        </li>
        <li>
          <strong>Anonimizar, bloquear ou eliminar</strong> dados
          desnecessários, excessivos ou tratados em desconformidade.
        </li>
        <li>
          <strong>Solicitar portabilidade</strong> dos dados a outro
          fornecedor de serviço (formato estruturado).
        </li>
        <li>
          <strong>Eliminar dados</strong> tratados com base em consentimento.
        </li>
        <li>
          <strong>Obter informações</strong> sobre os operadores com quem
          compartilhamos seus dados.
        </li>
        <li>
          <strong>Revogar o consentimento</strong> a qualquer tempo, com
          mesmo grau de facilidade que foi concedido.
        </li>
        <li>
          <strong>Peticionar perante a ANPD</strong> (Autoridade Nacional de
          Proteção de Dados).
        </li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos, acesse a área{" "}
        <Link href="/dashboard/privacidade">Privacidade</Link> no seu
        dashboard ou envie e-mail para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Responderemos em até
        15 dias.
      </p>

      <h2>8. Segurança da informação</h2>
      <p>
        Adotamos medidas técnicas e administrativas razoáveis para proteger
        seus dados, incluindo:
      </p>
      <ul>
        <li>Conexões criptografadas (TLS) entre seu navegador e nossos servidores.</li>
        <li>Hashing das senhas em repouso.</li>
        <li>Controle de acesso (RLS) por usuário no banco de dados.</li>
        <li>Logs de auditoria de ações sensíveis.</li>
        <li>Backups regulares e políticas de retenção.</li>
      </ul>
      <p>
        Ainda assim, nenhum sistema é totalmente imune. Em caso de incidente
        de segurança que possa acarretar risco ou dano relevante aos
        titulares, comunicaremos você e a ANPD em prazo razoável, conforme
        Art. 48 LGPD.
      </p>

      <h2>9. Tratamento por inteligência artificial</h2>
      <p>
        Usamos modelos de linguagem (Groq) para gerar planejamentos,
        análises de perfil e respostas no assistente. Você deve saber:
      </p>
      <ul>
        <li>
          O conteúdo que você envia ao assistente é processado em servidor
          terceiro (Groq) para gerar a resposta.
        </li>
        <li>
          Solicitamos contratualmente que o operador <strong>não use seu
          conteúdo para treinar modelos</strong>.
        </li>
        <li>
          O conteúdo gerado pela IA pode conter imprecisões. Revise antes de
          publicar.
        </li>
        <li>
          Decisões automatizadas que possam afetar seus interesses
          (Art. 20 LGPD): atualmente não tomamos decisões que produzam
          efeitos jurídicos ou afetem significativamente o titular com base
          unicamente em tratamento automatizado.
        </li>
      </ul>

      <h2>10. Cookies</h2>
      <p>
        Usamos cookies essenciais (autenticação, preferências da interface)
        e, mediante seu consentimento, cookies de analytics e marketing.
        Você pode gerenciar suas preferências a qualquer momento pelo banner
        de cookies. Veja a{" "}
        <Link href="/politica-de-cookies">Política de Cookies</Link> para a
        lista completa.
      </p>

      <h2>11. Crianças e adolescentes</h2>
      <p>
        O CR3SCE não se destina a menores de 18 anos. Se você tem ciência de
        que um menor criou conta sem consentimento de quem o representa
        legalmente, entre em contato com{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a> para que eliminemos
        os dados.
      </p>

      <h2>12. Encarregado pelo Tratamento de Dados (DPO)</h2>
      <p>
        Encarregado: <strong>[NOME DO ENCARREGADO]</strong>
        <br />
        E-mail: <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
        <br />
        Endereço para correspondência: {COMPANY_ADDRESS}
      </p>

      <h2>13. Atualizações desta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Em caso de
        alteração material, avisaremos pelo banner do site e, quando
        aplicável, por e-mail. A versão corrente está sempre disponível
        nesta página. Continuar usando o serviço após a atualização implica
        ciência da nova versão.
      </p>

      <p className="mt-12 text-sm">
        Em caso de dúvidas, escreva para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Você também pode
        registrar reclamação na{" "}
        <a
          href="https://www.gov.br/anpd/pt-br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Autoridade Nacional de Proteção de Dados (ANPD)
        </a>
        .
      </p>
    </>
  );
}
