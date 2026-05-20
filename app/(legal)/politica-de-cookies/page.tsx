import type { Metadata } from "next";
import Link from "next/link";
import {
  COOKIES_POLICY_VERSION,
  DPO_EMAIL,
  LAST_UPDATED,
} from "@/lib/lgpd/company";

export const metadata: Metadata = {
  title: "Politica de Cookies | CR3SCE",
  description:
    "Quais cookies o CR3SCE usa, para que servem e como voce pode gerenciar suas preferencias.",
};

export default function CookiesPolicyPage() {
  return (
    <>
      <h1>Politica de Cookies</h1>
      <p className="text-sm">
        Versao {COOKIES_POLICY_VERSION} &middot; Ultima atualizacao:{" "}
        {LAST_UPDATED}
      </p>

      <p>
        Esta Politica explica o que sao cookies e tecnologias semelhantes,
        para que usamos no CR3SCE e como voce pode gerenciar suas
        preferencias. Faz parte integrante da{" "}
        <Link href="/politica-de-privacidade">Politica de Privacidade</Link>.
      </p>

      <h2>1. O que sao cookies</h2>
      <p>
        Cookies sao pequenos arquivos de texto armazenados no seu dispositivo
        pelo navegador quando voce visita um site. Permitem que o site
        reconheca seu navegador entre paginas, mantendo voce logado e
        guardando preferencias. Tambem usamos tecnologias equivalentes
        (localStorage, sessionStorage).
      </p>

      <h2>2. Categorias de cookies que usamos</h2>

      <h3>2.1. Estritamente necessarios (essenciais)</h3>
      <p>
        Indispensaveis para o funcionamento basico do site. Nao podem ser
        desativados, pois sem eles voce nao consegue se autenticar nem usar
        as funcionalidades contratadas. <strong>Nao dependem de consentimento</strong>{" "}
        (Art. 7, V LGPD - execucao do contrato).
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie / chave</th>
            <th>Finalidade</th>
            <th>Duracao</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sb-*-auth-token</code> (Supabase)
            </td>
            <td>Mantem voce autenticado na sessao</td>
            <td>1 hora (renovavel)</td>
          </tr>
          <tr>
            <td>
              <code>supabase.auth.token</code>
            </td>
            <td>Refresh token de autenticacao</td>
            <td>30 dias</td>
          </tr>
          <tr>
            <td>
              <code>sidebar:state</code>
            </td>
            <td>Preferencia de visualizacao da sidebar</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td>
              <code>cr3sce_lgpd_consent</code>
            </td>
            <td>Salva suas preferencias de cookies</td>
            <td>1 ano</td>
          </tr>
          <tr>
            <td>
              <code>cr3sce_onboarding_draft_*</code>
            </td>
            <td>Rascunho do questionario para recuperacao em caso de queda</td>
            <td>Ate completar onboarding</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2. Analytics</h3>
      <p>
        Nos ajudam a entender como voce usa o produto (paginas mais
        visitadas, tempo de permanencia, conversao) para melhorar a
        experiencia. <strong>Sao gravados somente apos seu consentimento.</strong>
      </p>
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
            <td>Metricas agregadas de uso da aplicacao</td>
            <td>Instalado, ativacao mediante consentimento</td>
          </tr>
        </tbody>
      </table>

      <h3>2.3. Marketing</h3>
      <p>
        Usados para mensurar campanhas, remarketing e personalizacao de
        anuncios. <strong>Sao gravados somente apos seu consentimento.</strong>
      </p>
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
              Atualmente nao ha cookies de marketing ativos. Se vierem a ser
              adicionados, esta tabela sera atualizada.
            </td>
            <td>Inativo</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Como gerenciar suas preferencias</h2>
      <ul>
        <li>
          <strong>Banner de cookies:</strong> ao acessar o site pela
          primeira vez, voce escolhe quais categorias aceitar. Pode revisar
          a escolha a qualquer momento pela opcao &quot;Cookies&quot; no
          rodape.
        </li>
        <li>
          <strong>Configuracoes do navegador:</strong> voce tambem pode
          bloquear ou apagar cookies diretamente nas configuracoes do seu
          navegador. Isso pode impedir o funcionamento de partes do site.
        </li>
        <li>
          <strong>Revogacao de consentimento:</strong> a revogacao tem o
          mesmo grau de facilidade que a concessao (LGPD, Art. 8, par.
          5).
        </li>
      </ul>

      <h2>4. Cookies de terceiros</h2>
      <p>
        Cookies essenciais que listamos sao de fornecedores que precisamos
        para operar o produto (Supabase). Quando ativarmos analytics e
        marketing, os respectivos provedores tambem poderao gravar
        cookies em seu navegador, sob suas proprias politicas.
      </p>

      <h2>5. Alteracoes nesta politica</h2>
      <p>
        Atualizacoes serao publicadas nesta pagina com nova data e versao.
        Em caso de mudanca material, o banner reaparecera solicitando nova
        manifestacao de consentimento.
      </p>

      <h2>6. Contato</h2>
      <p>
        Duvidas sobre cookies? Escreva para{" "}
        <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
      </p>
    </>
  );
}
