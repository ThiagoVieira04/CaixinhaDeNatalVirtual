import classicoImage from "../../../assets/templates/template1.jpg";
import eleganteImage from "../../../assets/templates/template2.jpg";
import minimalistaImage from "../../../assets/templates/template3.jpg";
import comercialImage from "../../../assets/templates/template4.jpg";
import premiumImage from "../../../assets/templates/template5.jpg";
import divertidoImage from "../../../assets/templates/template6.jpg";
import type {
  StudioTemplate,
  TemplateKey,
  ThemeColors,
} from "./types";

export type AccentOption = {
  key: string;
  label: string;
  accent: string;
  accentText: string;
};

export const ACCENT_OPTIONS: AccentOption[] = [
  { key: "vermelho", label: "Vermelho", accent: "#C0392B", accentText: "#FFF6E6" },
  { key: "dourado", label: "Dourado", accent: "#D3A757", accentText: "#3B2A10" },
  { key: "verde", label: "Verde", accent: "#1F6B4F", accentText: "#FFF6E6" },
  { key: "vinho", label: "Vinho", accent: "#7C1D2E", accentText: "#FFF0DC" },
];

export const COLOR_PALETTES: Array<{
  key: string;
  label: string;
  preview: [string, string];
  headline: string;
  accent: string;
  accentText: string;
}> = [
  {
    key: "tradicional",
    label: "Tradicional",
    preview: ["#B83A3A", "#D3A757"],
    headline: "#FFF4D6",
    accent: "#D3A757",
    accentText: "#3B2A10",
  },
  {
    key: "elegante",
    label: "Elegante",
    preview: ["#0E2C22", "#C9A45C"],
    headline: "#EAD7A2",
    accent: "#D3A757",
    accentText: "#2E2110",
  },
  {
    key: "minimalista",
    label: "Minimalista",
    preview: ["#FFF8EA", "#174B38"],
    headline: "#2B4A3D",
    accent: "#1F6B4F",
    accentText: "#FFF6E6",
  },
  {
    key: "vibrante",
    label: "Vibrante",
    preview: ["#C22B3A", "#0E7A5F"],
    headline: "#C22B3A",
    accent: "#C0392B",
    accentText: "#FFF6E6",
  },
];

export const PROVISIONAL_TEMPLATE_ASSETS = true;

export const PROVISIONAL_TEMPLATE_NOTICE =
  "Modelos em versão provisória. As artes finais serão substituídas por arquivos 9:16 em alta resolução.";

export const TEMPLATES: StudioTemplate[] = [
  {
    key: "classico",
    name: "Natal Clássico",
    tagline: "Tradição em verde e vermelho",
    description:
      "Visual natalino tradicional, com destaque para o nome do estabelecimento.",
    image: classicoImage.src,
    imageFit: "cover",
    colors: {
      headline: "#FFF4D6",
      accent: "#D3A757",
      accentText: "#3B2A10",
      card: "#FFFDF8",
      cardText: "#4A1616",
      muted: "#8A5A4A",
      footer: "#FFE6B8",
      icon: "#B83A3A",
      tile: "#FFFFFF",
      border: null,
      headlinePlate: null,
      veil: "rgba(70,4,14,0.22)",
    },
    layout: {
      headlineTop: 500,
      headlineWidth: 810,
      headlineSize: 118,
      headlineFont: "script",
      headlineMaxLines: 3,
      cardTop: 884,
      cardWidth: 760,
      cardHeight: 224,
      nameSize: 54,
      ctaTop: 1156,
      ctaWidth: 560,
      ctaHeight: 104,
      footerTop: 1284,
      hasPhoto: false,
      photoTop: 262,
      photoSize: 200,
      footerText: "Faça parte dessa corrente de solidariedade!",
    },
  },
  {
    key: "elegante",
    name: "Natal Elegante",
    tagline: "Sofisticação em verde e dourado",
    description:
      "Composição refinada, com detalhes dourados e tipografia de destaque.",
    image: eleganteImage.src,
    imageFit: "contain",
    colors: {
      headline: "#EAD7A2",
      accent: "#D3A757",
      accentText: "#2E2110",
      card: "#0E2C22",
      cardText: "#F3E6C4",
      muted: "#C4B48B",
      footer: "#D8C08A",
      icon: "#C9A45C",
      tile: "#F7EFD9",
      border: "rgba(201,164,92,0.55)",
      headlinePlate: null,
      veil: "rgba(3,14,11,0.34)",
    },
    layout: {
      headlineTop: 560,
      headlineWidth: 830,
      headlineSize: 118,
      headlineFont: "script",
      headlineMaxLines: 3,
      cardTop: 988,
      cardWidth: 760,
      cardHeight: 224,
      nameSize: 54,
      ctaTop: 1268,
      ctaWidth: 560,
      ctaHeight: 104,
      footerTop: 1436,
      hasPhoto: true,
      photoTop: 300,
      photoSize: 190,
      footerText: "Um Natal de luz, partilha e esperança.",
    },
  },
  {
    key: "minimalista",
    name: "Natal Minimalista",
    tagline: "Composição limpa e elegante",
    description:
      "Fundo claro e poucos elementos, com a mensagem em destaque.",
    image: minimalistaImage.src,
    imageFit: "cover",
    colors: {
      headline: "#2B4A3D",
      accent: "#1F6B4F",
      accentText: "#FFF6E6",
      card: "#FFFFFF",
      cardText: "#26332D",
      muted: "#718076",
      footer: "#4B5E54",
      icon: "#174B38",
      tile: "#FFFFFF",
      border: "rgba(23,75,56,0.14)",
      headlinePlate: "rgba(255,251,242,0.86)",
      veil: "rgba(255,248,234,0.10)",
    },
    layout: {
      headlineTop: 520,
      headlineWidth: 760,
      headlineSize: 82,
      headlineFont: "serif",
      headlineMaxLines: 3,
      cardTop: 860,
      cardWidth: 740,
      cardHeight: 224,
      nameSize: 52,
      ctaTop: 1130,
      ctaWidth: 540,
      ctaHeight: 104,
      footerTop: 1286,
      hasPhoto: true,
      photoTop: 270,
      photoSize: 180,
      footerText: "Cada gesto conta. Feliz Natal!",
    },
  },
  {
    key: "divertido",
    name: "Natal Divertido",
    tagline: "Alegre, leve e descontraído",
    description:
      "Cores alegres e elementos natalinos descontraídos para encantar.",
    image: divertidoImage.src,
    imageFit: "cover",
    colors: {
      headline: "#C22B3A",
      accent: "#C0392B",
      accentText: "#FFF6E6",
      card: "#FFFFFF",
      cardText: "#174B38",
      muted: "#5B7A6C",
      footer: "#27664B",
      icon: "#0E7A5F",
      tile: "#FFF9EC",
      border: "rgba(201,164,92,0.65)",
      headlinePlate: "rgba(255,252,245,0.93)",
      veil: "rgba(255,255,255,0.02)",
    },
    layout: {
      headlineTop: 520,
      headlineWidth: 760,
      headlineSize: 100,
      headlineFont: "script",
      headlineMaxLines: 3,
      cardTop: 884,
      cardWidth: 740,
      cardHeight: 224,
      nameSize: 52,
      ctaTop: 1136,
      ctaWidth: 540,
      ctaHeight: 104,
      footerTop: 1288,
      hasPhoto: false,
      photoTop: 260,
      photoSize: 180,
      footerText: "Espalhe o espírito do Natal!",
    },
  },
  {
    key: "premium",
    name: "Natal Premium",
    tagline: "Acabamento refinado em preto e ouro",
    description:
      "Tons escuros e dourados, com destaque para a mensagem de agradecimento.",
    image: premiumImage.src,
    imageFit: "contain",
    colors: {
      headline: "#F1D58A",
      accent: "#D3A757",
      accentText: "#1B1408",
      card: "rgba(18,15,10,0.78)",
      cardText: "#F5E7C8",
      muted: "#CDBB94",
      footer: "#D9C08A",
      icon: "#D4AF5F",
      tile: "#F6EDD6",
      border: "rgba(212,175,95,0.65)",
      headlinePlate: null,
      veil: "rgba(0,0,0,0.32)",
    },
    layout: {
      headlineTop: 560,
      headlineWidth: 820,
      headlineSize: 112,
      headlineFont: "serif",
      headlineMaxLines: 3,
      cardTop: 1010,
      cardWidth: 760,
      cardHeight: 224,
      nameSize: 54,
      ctaTop: 1300,
      ctaWidth: 560,
      ctaHeight: 104,
      footerTop: 1470,
      hasPhoto: true,
      photoTop: 312,
      photoSize: 190,
      footerText: "Agradecemos por fazer parte deste Natal.",
    },
  },
  {
    key: "comercial",
    name: "Natal Comercial",
    tagline: "Mensagem direta para o seu negócio",
    description:
      "Nome do estabelecimento em destaque e chamada objetiva para contribuir.",
    image: comercialImage.src,
    imageFit: "cover",
    colors: {
      headline: "#FFF1D0",
      accent: "#D3A757",
      accentText: "#4A120F",
      card: "#FFFDF7",
      cardText: "#7A1A16",
      muted: "#9C5A4B",
      footer: "#FFE3B0",
      icon: "#C0392B",
      tile: "#FFFFFF",
      border: null,
      headlinePlate: null,
      veil: "rgba(90,4,12,0.24)",
    },
    layout: {
      headlineTop: 510,
      headlineWidth: 810,
      headlineSize: 104,
      headlineFont: "script",
      headlineMaxLines: 3,
      cardTop: 872,
      cardWidth: 780,
      cardHeight: 244,
      nameSize: 60,
      ctaTop: 1160,
      ctaWidth: 560,
      ctaHeight: 104,
      footerTop: 1288,
      hasPhoto: true,
      photoTop: 268,
      photoSize: 180,
      footerText: "Sua contribuição transforma este Natal.",
    },
  },
];

export const TEMPLATES_BY_KEY: Record<TemplateKey, StudioTemplate> =
  TEMPLATES.reduce(
    (accumulator, template) => {
      accumulator[template.key] = template;
      return accumulator;
    },
    {} as Record<TemplateKey, StudioTemplate>,
  );

export function getTemplate(key: TemplateKey | null): StudioTemplate | null {
  if (!key) return null;
  return TEMPLATES_BY_KEY[key] ?? null;
}

export function cloneColors(colors: ThemeColors): ThemeColors {
  return { ...colors };
}

export function accentOptionFor(accent: string): AccentOption {
  return (
    ACCENT_OPTIONS.find(
      (option) => option.accent.toLowerCase() === accent.toLowerCase(),
    ) ?? ACCENT_OPTIONS[1]
  );
}

