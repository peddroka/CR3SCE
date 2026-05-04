# Testes — CR3SCE

Stack: **Vitest** + **Testing Library** + **jsdom**.

## Estrutura

```
tests/
├── setup.ts                              # Setup global (mocks de IntersectionObserver, matchMedia, etc)
├── backend/
│   ├── utils.test.ts                     # cn() helper (Tailwind class merger)
│   ├── instruction-parser.test.ts        # Parser regex de instruções em PT
│   ├── silence-detect.test.ts            # invertSilences() — lógica de highlights
│   └── video-editor-quota.test.ts        # Sistema de quota diária por usuário
└── frontend/
    ├── logo.test.tsx                     # <Logo /> — render, sizes, brand text
    └── animate.test.tsx                  # <AnimateOnScroll /> e <AnimateOnLoad />
```

## Comandos

```bash
npm run test           # Roda todos os testes uma vez
npm run test:watch     # Modo watch (re-roda ao salvar)
npm run test:coverage  # Roda com relatório de cobertura
```

## Cobertura

Coleta cobertura de:
- `lib/**/*.{ts,tsx}` (back-end)
- `components/**/*.{ts,tsx}` (front-end)
- `app/api/**/*.{ts,tsx}` (API routes)

Excluídos: `node_modules`, `*.d.ts`, `components/ui/**` (primitivas shadcn geradas).

Relatórios: `text` (terminal), `html` (`coverage/index.html`), `json-summary`.

## Convenções

### Back-end (`tests/backend/`)
- Funções puras testadas diretamente (`parseInstruction`, `invertSilences`, `cn`).
- I/O isolado via mock do `process.cwd()` em diretório temporário (`os.tmpdir()`).
- **Não** chama FFmpeg / Whisper / Remotion reais (lentos e dependem de binários instalados).

### Front-end (`tests/frontend/`)
- Renderização via `@testing-library/react` em jsdom.
- Mocks globais (`IntersectionObserver`, `matchMedia`, `URL.createObjectURL`) em `setup.ts`.
- Foco em comportamento observável (texto, classes, atributos), não em detalhes de implementação.

## Adicionando um teste novo

1. Crie `tests/<área>/<feature>.test.{ts,tsx}`
2. Importe usando `@/...` (path alias do projeto)
3. Use `describe` para agrupar e `it` para casos individuais
4. Para testes assíncronos, use `await act()` para mudanças de estado React

Exemplo mínimo:

```ts
import { describe, expect, it } from "vitest";
import { minhaFuncao } from "@/lib/minha-feature";

describe("minhaFuncao", () => {
  it("faz X quando recebe Y", () => {
    expect(minhaFuncao("Y")).toBe("X");
  });
});
```

## Integração com CI

O job `test` roda **em paralelo** com `lint` e `typecheck` no workflow `ci.yml`.
O job `build` espera os 3 anteriores antes de compilar.
Cobertura é arquivada como artefato do GitHub Actions por 7 dias.
