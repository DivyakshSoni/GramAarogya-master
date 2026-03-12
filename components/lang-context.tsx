"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Language = "en" | "hi"

interface Translation {
  healthCheck: string
  consult: string
  records: string
  connect: string
  map: string
  meds: string
  pulse: string
  view: string
  team: string
  heroTitle: string
  heroSubtitle: string
}

const translations: Record<Language, Translation> = {
  en: {
    healthCheck: "AarogyaMitraAI",
    consult: "AarogyaConsult",
    records: "AarogyaRecords",
    connect: "AarogyaConnect",
    map: "AarogyaMap",
    meds: "AarogyaMeds",
    pulse: "AarogyaPulse",
    view: "AarogyaView",
    team: "AarogyaParivar",
    heroTitle: "Your Health, Our Priority",
    heroSubtitle: "AI-powered rural healthcare for all",
  },
  hi: {
    healthCheck: "स्वास्थ्य जाँच",
    consult: "परामर्श",
    records: "स्वास्थ्य रिकॉर्ड",
    connect: "डॉक्टर खोजें",
    map: "नक्शा",
    meds: "दवाइयाँ",
    pulse: "स्वास्थ्य समाचार",
    view: "स्वास्थ्य अंतर्दृष्टि",
    team: "हमारी टीम",
    heroTitle: "आपका स्वास्थ्य, हमारी जिम्मेदारी",
    heroSubtitle: "ग्रामीण भारत के लिए AI स्वास्थ्य सेवा",
  },
}

interface LangContextType {
  lang: Language
  setLang: (l: Language) => void
  t: Translation
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en")
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
