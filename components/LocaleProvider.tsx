"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/en";

type LocaleValue = { lang: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleValue | null>(null);

// Only the active language's dictionary is serialised to the client.
export function LocaleProvider({
  lang,
  dict,
  children,
}: LocaleValue & { children: ReactNode }) {
  return (
    <LocaleContext.Provider value={{ lang, dict }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside <LocaleProvider>");
  return value;
}
