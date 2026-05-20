# CR3SCE

Plataforma de planejamento de conteudo para Instagram (Next.js 15 + Supabase + Groq).

## Setup rapido

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # preencha as chaves
npm run dev
```

Aplique as migrations em ordem no Supabase Dashboard > SQL Editor:

```
scripts/001_create_profiles.sql
scripts/002_create_businesses.sql
...
scripts/011_lgpd_consent_and_audit.sql   # tabelas de LGPD
```

## LGPD - antes de publicar

Este projeto inclui a base de adequacao a LGPD (Lei 13.709/2018):

- Politica de Privacidade em [/politica-de-privacidade](app/(legal)/politica-de-privacidade/page.tsx)
- Termos de Uso em [/termos-de-uso](app/(legal)/termos-de-uso/page.tsx)
- Politica de Cookies em [/politica-de-cookies](app/(legal)/politica-de-cookies/page.tsx)
- Banner de cookies + dialog de preferencias
- Checkbox de aceite no sign-up
- Painel de privacidade do usuario em [/dashboard/privacidade](app/dashboard/privacidade/page.tsx)
- Endpoints DSAR em [app/api/lgpd/](app/api/lgpd)
- Tabelas `consents`, `audit_logs`, `data_deletion_requests`

### Checklist antes de publicar

1. **Preencher placeholders** nos textos legais:
   - Defina as variaveis `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_CNPJ`,
     `NEXT_PUBLIC_COMPANY_ADDRESS`, `NEXT_PUBLIC_DPO_EMAIL`, `NEXT_PUBLIC_CONTACT_EMAIL`
     (em [.env.example](.env.example)).
   - Os placeholders restantes (ex. `[CIDADE/UF]` em Termos de Uso) precisam ser
     editados nos arquivos das paginas legais.
2. **Aplicar a migration** `scripts/011_lgpd_consent_and_audit.sql` no Supabase.
3. **Revisao juridica** dos textos por um advogado antes de publicar.
4. Bumpar `PRIVACY_POLICY_VERSION` / `TERMS_OF_USE_VERSION` / `COOKIES_POLICY_VERSION`
   / `CONSENT_BANNER_VERSION` em [lib/lgpd/company.ts](lib/lgpd/company.ts) sempre
   que o texto mudar materialmente. Isso invalida consentimentos antigos.

### Itens fora desta entrega

- Cron job que efetiva a exclusao 30 dias apos `data_deletion_requests` (deletar
  dados via service role + revogar sessoes). Hoje o registro fica como `pending`.
- E-mail de confirmacao dos DSARs (acesso, exclusao).
- Integracao com ANPD para reporte de incidentes.

## Scripts

```bash
npm run dev         # dev server (turbopack)
npm run build       # build de producao
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest run
```
