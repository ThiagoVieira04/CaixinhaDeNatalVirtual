"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cloneColors,
  getTemplate,
} from "@/lib/studio/templates";
import {
  DEFAULT_CTA,
  DEFAULT_MESSAGE,
  DEFAULT_SECONDARY,
  type ArtworkConfig,
  type StudioTemplate,
  type TemplateKey,
  type ThemeColors,
} from "@/lib/studio/types";

export type StudioState = {
  templateKey: TemplateKey | null;
  businessName: string;
  message: string;
  secondary: string;
  cta: string;
  theme: ThemeColors | null;
  logo: string | null;
  photo: string | null;
  campaignLink: string;
};

const defaultTemplate = getTemplate("classico");

const INITIAL_STATE: StudioState = {
  templateKey: "classico",
  businessName: "",
  message: DEFAULT_MESSAGE,
  secondary: DEFAULT_SECONDARY,
  cta: DEFAULT_CTA,
  theme: defaultTemplate ? cloneColors(defaultTemplate.colors) : null,
  logo: null,
  photo: null,
  campaignLink: "",
};

type StudioContextValue = {
  state: StudioState;
  template: StudioTemplate | null;
  update: (patch: Partial<StudioState>) => void;
  selectTemplate: (key: TemplateKey) => void;
  applyTheme: (patch: Partial<ThemeColors>) => void;
  resetColors: () => void;
  startNewArtwork: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(INITIAL_STATE);

  const update = useCallback((patch: Partial<StudioState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const selectTemplate = useCallback((key: TemplateKey) => {
    setState((current) => {
      const template = getTemplate(key);
      return {
        ...current,
        templateKey: key,
        theme: template ? cloneColors(template.colors) : current.theme,
      };
    });
  }, []);

  const applyTheme = useCallback((patch: Partial<ThemeColors>) => {
    setState((current) => {
      if (!current.templateKey) return current;
      const template = getTemplate(current.templateKey);
      if (!template) return current;
      return {
        ...current,
        theme: {
          ...(current.theme ?? template.colors),
          ...patch,
        },
      };
    });
  }, []);

  const resetColors = useCallback(() => {
    setState((current) => {
      if (!current.templateKey) return current;
      const template = getTemplate(current.templateKey);
      if (!template) return current;
      return { ...current, theme: cloneColors(template.colors) };
    });
  }, []);

  const startNewArtwork = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const template = useMemo(
    () => getTemplate(state.templateKey),
    [state.templateKey],
  );

  const value = useMemo<StudioContextValue>(
    () => ({
      state,
      template,
      update,
      selectTemplate,
      applyTheme,
      resetColors,
      startNewArtwork,
    }),
    [
      state,
      template,
      update,
      selectTemplate,
      applyTheme,
      resetColors,
      startNewArtwork,
    ],
  );

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio precisa estar dentro de StudioProvider.");
  }
  return context;
}

export function buildArtworkConfig(
  template: StudioTemplate,
  state: StudioState,
): ArtworkConfig {
  return {
    template,
    businessName: state.businessName.trim(),
    message: state.message,
    secondary: state.secondary,
    cta: state.cta,
    logo: state.logo,
    photo: state.photo,
    theme: state.theme ?? cloneColors(template.colors),
  };
}
