import type { Metadata } from "next";
import Link from "next/link";
import {
  COOKIES_POLICY_VERSION,
  DPO_EMAIL,
  LAST_UPDATED,
} from "@/lib/lgpd/company";

export const metadata: Metadata = {
  title: "Política de Cookies | CR3SCE",
  description:
    "Quais cookies o CR3SCE usa, para que servem e como você pode gerenciar suas preferências.",
};

export default function CookiesPolicyPage() {
  return (
    <>
      <h1>Política de Cookies</h1>
      <p className="text-sm">
        Versão {COOKIES_POLICY_VERSION} &middot; Última atualização:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Esta Política explica o que são cookies e tecnologias semelhantes,
        para que usamos no CR3SCE e como você pode gerenciar suas
        preferências. Faz parte integrante da{" "}
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. O que são cookies</h2>
      <p>
        Cookies são pequenos arquivos de texto armazenados no seu dispositivo
        pelo navegador quando você visita um site. Permitem que o site
        reconheça seu navegador entre páginas, mantendo você logado e
        guardando preferências. Também usamos tecnologias equivalentes
        (localStorage, sessionStorage).
      </p>

      <h2>2. Categorias de cookies que usamos</h2>

      <h3>2.1. Estritamente necessários (essenciais)</h3>
      <p>
        Indispensáveis para o funcionamento básico do site. Não podem ser
        desativados, pois sem eles você não consegue se autenticar nem usar
        as funcionalidades contratadas. <strong>Não dependem de consentimento</strong>{" "}
        (Art. 7, V LGPD - execução do contrato).
      </p>
      <div className="-mx-2 overflow-x-auto px-2 [&_table]:min-w-[34rem]">
      <table>
        <thead>
          <tr>
            <th>Cookie / chave</th>
            <th>Finalidade</th>
            <th>Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sb-*-auth-token</code> (Supabase)
            </td>
            <td>Mantém você autenticado na sessão</td>
            <td>1 hora (renovável)</td>
          </tr>
          <tr>
            <td>
              <code>supabase.auth.token</code>
            </td>
            <td>Refresh token de autenticação</td>
            <td>30 dias</td>
          </tr>
          <tr>
            <td>
              <code>sidebar:state</code>
            </td>
            <td>Preferência de visualização da sidebar</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td>
              <code>cr3sce_lgpd_consent</code>
            </td>
            <td>Salva suas preferências de cookies</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td>
              <code>cr3sce_onboarding_draft_*</code>
            </td>
            <td>Rascunho do questionário para recuperação em caso de queda</td>
            <td>Até completar onboarding</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h3>2.2. Analytics</h3>
      <p>
        Nos ajudam a entender como você usa o produto (páginas mais
        visitadas, tempo de permanência, conversão) para melhorar a
        experiência. <strong>São gravados somente após seu consentimento.</strong>
      </p>
      <div className="-mx-2 overflow-x-auto px-2 [&_table]:min-w-[34rem]">
      <table>
        <thead>
          <tr>
            <th>Provedor</th>
            <th>Finalidade</th>
            <th>Status atual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vercel Analytics</td>
            <td>Métricas agregadas de uso da aplicação</td>
            <td>Instalado, ativação mediante consentimento</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h3>2.3. Marketing</h3>
      <p>
        Usados para mensurar campanhas, remarketing e personalizacao de
        anúncios. <strong>São gravados somente após seu consentimento.</strong>
      </p>
      <div className="-mx-2 overflow-x-auto px-2 [&_table]:min-w-[34rem]">
      <table>
        <thead>
          <tr>
            <th>Provedor</th>
            <th>Finalidade</th>
            <th>Status atual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>(a definir)</td>
            <td>
              Atualmente não há cookies de marketing ativos. Se vierem a ser
              adicionados, esta tabela será atualizada.
            </td>
            <td>Inativo</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h2>3. Como gerenciar suas preferências</h2>
      <ul>
        <li>
          <strong>Banner de cookies:</strong> ao acessar o site pela
          primeira vez, você escolhe quais categorias aceitar. Pode revisar
          a escolha a qualquer momento pela opção &quot;Cookies&quot; no
          rodapé.
        </li>
        <li>
          <strong>Configurações do navegador:</strong> você também pode
          bloquear ou apagar cookies diretamente nas configurações do seu
          navegador. Isso pode impedir o funcionamento de partes do site.
        </li>
        <li>
          <strong>Revogação de consentimento:</strong> a revogação tem o
          mesmo grau de facilidade que a concessão (LGPD, Art. 8, par.
          5).
        </li>
      </ul>

      <h2>4. Cookies de terceiros</h2>
      <p>
        Cookies essenciais que listamos são de fornecedores que precisamos
        para operar o produto (Supabase). Quando ativarmos analytics e
        marketing, os respectivos provedores também poderão gravar
        cookies em seu navegador, sob suas próprias políticas.
      </p>

      <h2>5. Alterações nesta política</h2>
      <p>
        Atualizações serão publicadas nesta página com nova data e versão.
        Em caso de mudança material, o banner reaparecerá solicitando nova
        manifestação de consentimento.
      </p>

      <h2>6. Contato</h2>
      <p>
        Dúvidas sobre cookies? Escreva para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
      </p>
    </>
  );
}
