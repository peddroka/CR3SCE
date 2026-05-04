# CI/CD — CR3SCE

Pipelines automatizados para qualidade e deploy.

## Workflows

### `ci.yml` — Continuous Integration
Roda em `push` para `main` e em todos os PRs abertos contra `main`.

**Jobs em paralelo:**
- **lint** — ESLint nos arquivos `.ts` / `.tsx`
- **typecheck** — `tsc --noEmit` em todo o projeto
- **build** — `next build` completo (frontend + API routes)
- **audit** — `npm audit` para vulnerabilidades High/Critical
- **api-routes-check** — verifica que cada `route.ts` exporta um handler HTTP válido

O job `build` espera `lint` + `typecheck` antes de rodar.

### `deploy.yml` — Continuous Deployment (production)
Dispara em `push` para `main` (e manualmente via `workflow_dispatch`).

Deploy automático para a Vercel em produção.

### `preview.yml` — Preview deploy por PR
Para cada PR, faz deploy de preview na Vercel e comenta a URL no PR.

## Secrets necessários

Configure no GitHub em **Settings → Secrets and variables → Actions**:

| Secret | Descrição | Onde obter |
|---|---|---|
| `VERCEL_TOKEN` | Token de acesso pessoal Vercel | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID da organização | `vercel project ls` ou `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | `vercel project ls` ou `.vercel/project.json` |

Para gerar `ORG_ID` e `PROJECT_ID` localmente:
```bash
npm i -g vercel
vercel link
cat .vercel/project.json
```

## Scripts locais

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint + auto-fix
npm run typecheck   # TypeScript --noEmit
npm run build       # Build de produção
npm run ci          # lint + typecheck + build (igual ao CI)
```

## Dependabot

`dependabot.yml` configura:
- **npm:** atualizações semanais (segunda 06:00 BRT), agrupadas por família (Radix UI, Remotion, Next/React, AI SDK)
- **GitHub Actions:** atualizações mensais
- **Major versions ignoradas** para evitar breaking changes automáticos

## Templates

- **PR template:** checklist de qualidade + tipo de mudança
- **Issue templates:** bug report e feature request
- **CODEOWNERS:** revisores automáticos por área do projeto

## Estrutura

```
.github/
├── workflows/
│   ├── ci.yml          # Lint, typecheck, build, audit
│   ├── deploy.yml      # Deploy production (main)
│   └── preview.yml     # Preview deploy por PR
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── pull_request_template.md
├── dependabot.yml
├── CODEOWNERS
└── README.md (este arquivo)
```
