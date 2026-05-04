// Minimal ESLint 10 flat config — TypeScript-aware, no plugin extends to avoid
// circular-config issues with the legacy `next/core-web-vitals` shareable config.
// Next.js project already runs `next build` (which lints internally) in CI.

import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      ".next-stale-*/**",
      "node_modules/**",
      "tmp/**",
      "public/**",
      "remotion/**",
      "next-env.d.ts",
      "**/*.d.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
];
