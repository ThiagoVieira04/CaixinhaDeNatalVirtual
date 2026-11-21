export type TemplateKey =
  | "classico"
  | "elegante"
  | "minimalista"
  | "divertido"
  | "premium"
  | "comercial";

export type ThemeColors = {
  headline: string;
  accent: string;
  accentText: string;
  card: string;
  cardText: string;
  muted: string;
  footer: string;
  icon: string;
  tile: string;
  border: string | null;
  headlinePlate: string | null;
  veil: string;
};

export type TemplateLayout = {
  headlineTop: number;
  headlineWidth: number;
  headlineSize: number;
  headlineFont: "script" | "serif";
  headlineMaxLines: number;
  cardTop: number;
  cardWidth: number;
  cardHeight: number;
  nameSize: number;
  ctaTop: number;
  ctaWidth: number;
  ctaHeight: number;
  footerTop: number;
  hasPhoto: boolean;
  photoTop: number;
  photoSize: number;
  footerText: string;
};

export type TemplateImageFit = "cover" | "contain";

export type StudioTemplate = {
  key: TemplateKey;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageFit: TemplateImageFit;
  colors: ThemeColors;
  layout: TemplateLayout;
};

export type ArtworkConfig = {
  template: StudioTemplate;
  businessName: string;
  message: string;
  secondary: string;
  cta: string;
  logo: string | null;
  photo: string | null;
  theme: ThemeColors;
};

export const DEFAULT_BUSINESS_NAME = "Sua Empresa";
export const DEFAULT_MESSAGE = "Neste Natal, sua contribuição faz a diferença!";
export const DEFAULT_SECONDARY = "Juntos por um Natal melhor";
export const DEFAULT_CTA = "Contribua via PIX";
export const ART_WIDTH = 1080;
export const ART_HEIGHT = 1920;
