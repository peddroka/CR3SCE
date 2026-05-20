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
  title: "Politica de Privacidade | CR3SCE",
  description:
    "Como o CR3SCE coleta, usa, compartilha e protege seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Politica de Privacidade</h1>
      <p className="text-sm">
        Versao {PRIVACY_POLICY_VERSION} &middot; Ultima atualizacao:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Esta Politica de Privacidade descreve como{" "}
        <strong>{COMPANY_NAME}</strong>, inscrita no CNPJ{" "}
        <strong>{COMPANY_CNPJ}</strong>, com sede em {COMPANY_ADDRESS}{" "}
        (&quot;<strong>CR3SCE</strong>&quot;, &quot;<strong>nos</strong>&quot;
        ou &quot;<strong>nosso</strong>&quot;), trata os dados pessoais dos
        usuarios (&quot;<strong>voce</strong>&quot; ou &quot;
        <strong>titular</strong>&quot;) do nosso produto, em conformidade com a
        Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 - LGPD) e
        demais legislacoes aplicaveis.
      </p>

      <h2>1. Quem e o controlador dos seus dados</h2>
      <p>
        O controlador dos dados pessoais tratados nesta plataforma e{" "}
        <strong>{COMPANY_NAME}</strong>, CNPJ {COMPANY_CNPJ}, com sede em{" "}
        {COMPANY_ADDRESS}. Para qualquer assunto relacionado a privacidade,
        voce pode falar com nosso Encarregado pelo Tratamento de Dados (DPO)
        pelo e-mail{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
      </p>

      <h2>2. Quais dados pessoais coletamos</h2>
      <h3>2.1. Dados que voce nos fornece diretamente</h3>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, sobrenome, endereco de e-mail e
          senha (armazenada em formato seguro de hash).
        </li>
        <li>
          <strong>Onboarding e perfil do negocio:</strong> nome do negocio,
          nicho de atuacao, descricao do publico-alvo, nome do responsavel
          pelo negocio, usuario do Instagram (@), estilo de comunicacao,
          tom de voz e descricao da marca.
        </li>
        <li>
          <strong>Capturas de tela e imagens de bio:</strong> imagens enviadas
          para analise do perfil, armazenadas em bucket privado do Supabase
          Storage.
        </li>
        <li>
          <strong>Dados de evolucao:</strong> numero de seguidores, media de
          visualizacoes, equipamentos disponiveis e investimento mensal
          declarado.
        </li>
        <li>
          <strong>Interacoes com a IA:</strong> mensagens enviadas ao
          assistente de conteudo e parametros usados em geracao de imagens.
        </li>
        <li>
          <strong>Pagamento:</strong> e-mail e identificador do pedido
          fornecidos por nosso processador de pagamentos. <strong>Nao
          armazenamos dados de cartao de credito</strong>; essas informacoes
          sao tratadas exclusivamente pela Cakto.
        </li>
      </ul>

      <h3>2.2. Dados coletados automaticamente</h3>
      <ul>
        <li>
          <strong>Identificadores de sessao:</strong> cookies essenciais de
          autenticacao para manter voce logado.
        </li>
        <li>
          <strong>Dados tecnicos:</strong> endereco IP, tipo e versao do
          navegador, sistema operacional, paginas visitadas e timestamps,
          quando registramos em logs de auditoria.
        </li>
        <li>
          <strong>Analytics e marketing (mediante consentimento):</strong>{" "}
          metricas agregadas de uso, eventos de campanha. Consulte a{" "}
          <Link href="/politica-de-cookies">Politica de Cookies</Link> para
          detalhes.
        </li>
      </ul>

      <h2>3. Para que usamos seus dados e com que base legal</h2>
      <p>
        Toda operacao com dados pessoais e baseada em uma das hipoteses do
        Art. 7 da LGPD. As principais sao:
      </p>
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
            <td>Execucao de contrato (Art. 7, V)</td>
          </tr>
          <tr>
            <td>
              Gerar planejamento de conteudo, score de perfil, calendario e
              imagens
            </td>
            <td>
              Perfil do negocio, dados de Instagram, prompts de IA,
              screenshots
            </td>
            <td>Execucao de contrato (Art. 7, V)</td>
          </tr>
          <tr>
            <td>Processar pagamento e liberar acesso pago</td>
            <td>E-mail, ID do pedido</td>
            <td>
              Execucao de contrato (Art. 7, V) e cumprimento de obrigacao
              legal/fiscal (Art. 7, II)
            </td>
          </tr>
          <tr>
            <td>Detectar fraudes, abusos e proteger o servico</td>
            <td>IP, user agent, logs de auditoria</td>
            <td>Legitimo interesse (Art. 7, IX)</td>
          </tr>
          <tr>
            <td>Enviar comunicados de marketing</td>
            <td>E-mail, nome</td>
            <td>Consentimento (Art. 7, I) - opt-in revogavel</td>
          </tr>
          <tr>
            <td>Cookies de analytics e marketing</td>
            <td>Identificadores de dispositivo, eventos</td>
            <td>Consentimento (Art. 7, I)</td>
          </tr>
          <tr>
            <td>Cumprir requisicoes legais e regulatorias</td>
            <td>Qualquer dado solicitado</td>
            <td>Obrigacao legal (Art. 7, II)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Com quem compartilhamos seus dados</h2>
      <p>
        Compartilhamos dados estritamente com os operadores listados abaixo,
        que processam os dados em nosso nome sob contrato e instrucoes
        especificas:
      </p>
      <ul>
        <li>
          <strong>Supabase (Supabase Inc., EUA)</strong> - banco de dados,
          autenticacao e armazenamento de arquivos. Recebe: dados de cadastro,
          perfil, conteudo gerado e arquivos enviados.
        </li>
        <li>
          <strong>Groq (Groq Inc., EUA)</strong> - inferencia de IA para
          geracao de texto. Recebe: mensagens enviadas ao assistente e
          contexto resumido do negocio. <strong>Configuramos para nao usar
          seu conteudo em treinamento.</strong>
        </li>
        <li>
          <strong>Cakto (Cakto Pagamentos, Brasil)</strong> - processamento de
          pagamentos. Recebe: e-mail, valor e identificador do pedido.
        </li>
        <li>
          <strong>Provedores de hospedagem e CDN</strong> - servidores onde a
          aplicacao roda. Recebem dados de requisicao (IP, paginas
          acessadas).
        </li>
      </ul>
      <p>
        Tambem podemos compartilhar dados quando exigido por autoridade
        competente ou por determinacao judicial. Nao vendemos seus dados
        pessoais sob nenhuma hipotese.
      </p>

      <h2>5. Transferencia internacional de dados</h2>
      <p>
        Alguns de nossos operadores (Supabase, Groq) estao localizados fora
        do Brasil. As transferencias internacionais ocorrem com base em
        garantias contratuais especificas (clausulas contratuais e padroes
        equivalentes aos exigidos pela LGPD, Art. 33), assegurando o mesmo
        nivel de protecao.
      </p>

      <h2>6. Por quanto tempo guardamos seus dados</h2>
      <ul>
        <li>
          <strong>Dados de conta e perfil:</strong> enquanto a conta estiver
          ativa.
        </li>
        <li>
          <strong>Dados de geracao de conteudo:</strong> enquanto a conta
          estiver ativa, ou ate voce solicitar a exclusao.
        </li>
        <li>
          <strong>Dados fiscais de pagamento:</strong> 5 anos apos a
          transacao, conforme prazo legal (Art. 173 CTN).
        </li>
        <li>
          <strong>Logs de auditoria:</strong> 6 anos, alinhado ao prazo
          prescricional cabivel.
        </li>
        <li>
          <strong>Apos solicitacao de exclusao:</strong> os dados sao
          excluidos em ate 30 dias, ressalvadas as hipoteses do Art. 16 LGPD
          (cumprimento de obrigacao legal, estudo por orgao de pesquisa com
          anonimizacao, exercicio regular de direitos).
        </li>
      </ul>

      <h2>7. Seus direitos como titular (Art. 18 LGPD)</h2>
      <p>Voce tem direito a, a qualquer momento:</p>
      <ul>
        <li>
          <strong>Confirmar</strong> a existencia de tratamento dos seus
          dados.
        </li>
        <li>
          <strong>Acessar</strong> seus dados (exportacao em formato JSON
          disponivel em <Link href="/dashboard/privacidade">Privacidade</Link>{" "}
          dentro da sua conta).
        </li>
        <li>
          <strong>Corrigir</strong> dados incompletos, inexatos ou
          desatualizados (via{" "}
          <Link href="/dashboard/settings">Configuracoes</Link>).
        </li>
        <li>
          <strong>Anonimizar, bloquear ou eliminar</strong> dados
          desnecessarios, excessivos ou tratados em desconformidade.
        </li>
        <li>
          <strong>Solicitar portabilidade</strong> dos dados a outro
          fornecedor de servico (formato estruturado).
        </li>
        <li>
          <strong>Eliminar dados</strong> tratados com base em consentimento.
        </li>
        <li>
          <strong>Obter informacoes</strong> sobre os operadores com quem
          compartilhamos seus dados.
        </li>
        <li>
          <strong>Revogar o consentimento</strong> a qualquer tempo, com
          mesmo grau de facilidade que foi concedido.
        </li>
        <li>
          <strong>Peticionar perante a ANPD</strong> (Autoridade Nacional de
          Protecao de Dados).
        </li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos, acesse a area{" "}
        <Link href="/dashboard/privacidade">Privacidade</Link> no seu
        dashboard ou envie e-mail para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Responderemos em ate
        15 dias.
      </p>

      <h2>8. Seguranca da informacao</h2>
      <p>
        Adotamos medidas tecnicas e administrativas razoaveis para proteger
        seus dados, incluindo:
      </p>
      <ul>
        <li>Conexoes criptografadas (TLS) entre seu navegador e nossos servidores.</li>
        <li>Hashing das senhas em repouso.</li>
        <li>Controle de acesso (RLS) por usuario no banco de dados.</li>
        <li>Logs de auditoria de acoes sensiveis.</li>
        <li>Backups regulares e politicas de retencao.</li>
      </ul>
      <p>
        Ainda assim, nenhum sistema e totalmente imune. Em caso de incidente
        de seguranca que possa acarretar risco ou dano relevante aos
        titulares, comunicaremos voce e a ANPD em prazo razoavel, conforme
        Art. 48 LGPD.
      </p>

      <h2>9. Tratamento por inteligencia artificial</h2>
      <p>
        Usamos modelos de linguagem (Groq) para gerar planejamentos,
        analises de perfil e respostas no assistente. Voce deve saber:
      </p>
      <ul>
        <li>
          O conteudo que voce envia ao assistente e processado em servidor
          terceiro (Groq) para gerar a resposta.
        </li>
        <li>
          Solicitamos contratualmente que o operador <strong>nao use seu
          conteudo para treinar modelos</strong>.
        </li>
        <li>
          O conteudo gerado pela IA pode conter imprecisoes. Revise antes de
          publicar.
        </li>
        <li>
          Decisoes automatizadas que possam afetar seus interesses
          (Art. 20 LGPD): atualmente nao tomamos decisoes que produzam
          efeitos juridicos ou afetem significativamente o titular com base
          unicamente em tratamento automatizado.
        </li>
      </ul>

      <h2>10. Cookies</h2>
      <p>
        Usamos cookies essenciais (autenticacao, preferencias da interface)
        e, mediante seu consentimento, cookies de analytics e marketing.
        Voce pode gerenciar suas preferencias a qualquer momento pelo banner
        de cookies. Veja a{" "}
        <Link href="/politica-de-cookies">Politica de Cookies</Link> para a
        lista completa.
      </p>

      <h2>11. Criancas e adolescentes</h2>
      <p>
        O CR3SCE nao se destina a menores de 18 anos. Se voce tem ciencia de
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
        Endereco para correspondencia: {COMPANY_ADDRESS}
      </p>

      <h2>13. Atualizacoes desta politica</h2>
      <p>
        Esta politica pode ser atualizada periodicamente. Em caso de
        alteracao material, avisaremos pelo banner do site e, quando
        aplicavel, por e-mail. A versao corrente esta sempre disponivel
        nesta pagina. Continuar usando o servico apos a atualizacao implica
        ciencia da nova versao.
      </p>

      <p className="mt-12 text-sm">
        Em caso de duvidas, escreva para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Voce tambem pode
        registrar reclamacao na{" "}
        <a
          href="https://www.gov.br/anpd/pt-br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Autoridade Nacional de Protecao de Dados (ANPD)
        </a>
        .
      </p>
    </>
  );
}
