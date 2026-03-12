"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLang } from "@/components/lang-context"

const translations = [
  { lang: "English", text: "GramAarogya" },
  { lang: "हिन्दी", text: "ग्रामआरोग्य" },
  { lang: "ગુજરાતી", text: "ગ્રામઆરોગ્ય" },
  { lang: "বাংলা", text: "গ্রামআরোগ্য" },
  { lang: "मराठी", text: "ग्रामआरोग्य" },
  { lang: "தமிழ்", text: "கிராமாரோக்கிய" },
]

const greetings = [
  { lang: "English", text: "Hello" },
  { lang: "हिन्दी", text: "नमस्ते" },
  { lang: "ગુજરાતી", text: "નમસ્તે" },
  { lang: "বাংলা", text: "নমস্কার" },
  { lang: "मराठी", text: "नमस्कार" },
  { lang: "தமிழ்", text: "வணக்கம்" },
]

export default function Navbar() {
  const [indexLeft, setIndexLeft] = useState(0)
  const [indexRight, setIndexRight] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    const intervalLeft = setInterval(() => {
      setIndexLeft((prevIndex) => (prevIndex + 1) % translations.length)
    }, 3000)

    const intervalRight = setInterval(() => {
      setIndexRight((prevIndex) => (prevIndex + 1) % greetings.length)
    }, 3000)

    return () => {
      clearInterval(intervalLeft)
      clearInterval(intervalRight)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Animated GramAarogya */}
        <div className="flex items-center space-x-2">
          <Link href="/hero" className="mr-6 flex items-center">
            <span className="text-xl font-bold italic transition-all duration-1000 sm:text-2xl lg:text-3xl">
              {translations[indexLeft].text}
            </span>
          </Link>
        </div>

        {/* Desktop Navbar Links — PS-aligned only */}
        <nav className="hidden sm:flex flex-1 items-center justify-center space-x-4 sm:space-x-6 text-sm font-medium">
          <Link href="/health-check" className="transition-colors hover:text-primary">
            AarogyaMitraAI
          </Link>
          <Link href="/consultation" className="transition-colors hover:text-primary">
            AarogyaConsult
          </Link>
          <Link href="/health-records" className="transition-colors hover:text-primary">
            AarogyaRecords
          </Link>
          <Link href="/medicine" className="transition-colors hover:text-primary">
            AarogyaMeds
          </Link>
          <Link href="/medicine-stock" className="transition-colors hover:text-primary">
            HospitalStock
          </Link>
        </nav>

        {/* Mobile Dropdown (Single Visible Option) */}
        <div className="relative sm:hidden flex flex-1 justify-center">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-base md:text-lg font-medium flex items-center space-x-2 border rounded-lg px-3 py-1.5 md:px-4 md:py-2 bg-dark text-white"
            aria-expanded={dropdownOpen}
            aria-controls="mobile-menu"
          >
            <span>Menu</span>
            {dropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {dropdownOpen && (
            <div
              id="mobile-menu"
              className="absolute top-12 left-1/2 transform -translate-x-1/2 w-[90%] bg-gray-900 shadow-lg rounded-lg text-center py-3 border border-gray-700 z-50"
            >
              <Link href="/health-check" className="block py-2 text-base font-medium hover:text-primary transition" onClick={() => setDropdownOpen(false)}>
                AarogyaMitraAI
              </Link>
              <Link href="/consultation" className="block py-2 text-base font-medium hover:text-primary transition" onClick={() => setDropdownOpen(false)}>
                AarogyaConsult
              </Link>
              <Link href="/health-records" className="block py-2 text-base font-medium hover:text-primary transition" onClick={() => setDropdownOpen(false)}>
                AarogyaRecords
              </Link>
              <Link href="/medicine" className="block py-2 text-base font-medium hover:text-primary transition" onClick={() => setDropdownOpen(false)}>
                AarogyaMeds
              </Link>
              <Link href="/medicine-stock" className="block py-2 text-base font-medium hover:text-primary transition" onClick={() => setDropdownOpen(false)}>
                HospitalStock
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Lang Toggle + Login + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="text-xs px-2 py-1 rounded-full border border-gray-600 hover:border-blue-400 hover:text-blue-400 transition font-medium"
            title="Switch Language / भाषा बदलें"
          >
            {lang === "en" ? "🌐 हिं" : "🌐 EN"}
          </button>
          <Link
            href="/login"
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition hidden sm:block"
          >
            Login
          </Link>
          <span className="text-lg font-bold italic transition-all duration-1000 sm:text-xl lg:text-2xl">
            {greetings[indexRight].text}
          </span>
        </div>
      </div>
    </header>
  )
}

