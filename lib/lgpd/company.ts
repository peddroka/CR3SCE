// Centraliza os placeholders da empresa para os textos legais.
// SUBSTITUA pelos dados reais antes de publicar (ou exponha via env e
// fazer fallback aqui). A versao das politicas e usada para invalidar
// consentimentos antigos quando o texto mudar materialmente.

export const COMPANY_NAME =
  process.env.NEXT_PUBLIC_COMPANY_NAME || "[NOME DA EMPRESA]";
export const COMPANY_CNPJ =
  process.env.NEXT_PUBLIC_COMPANY_CNPJ || "[CNPJ]";
export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "[ENDERECO COMPLETO]";
export const DPO_EMAIL =
  process.env.NEXT_PUBLIC_DPO_EMAIL || "[EMAIL DO ENCARREGADO]";
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contato@cr3sce.com";

// Versoes dos textos legais. Quando mudar materialmente, bumpar o major.
// Isso invalida consentimentos antigos e mostra o banner novamente.
export const PRIVACY_POLICY_VERSION = "1.0.0";
export const TERMS_OF_USE_VERSION = "1.0.0";
export const COOKIES_POLICY_VERSION = "1.0.0";
export const CONSENT_BANNER_VERSION = "1.0.0";

export const LAST_UPDATED = "19/05/2026";
