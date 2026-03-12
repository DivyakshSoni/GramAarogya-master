"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Mic, MicOff, AlertTriangle, CheckCircle, Heart, Leaf, Utensils, XCircle, Stethoscope, Clock } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const translations = [
  { lang: "English", heading: "AarogyaMitra AI", placeholder: "Describe your symptoms in detail..." },
  { lang: "हिन्दी", heading: "आरोग्य मित्र AI", placeholder: "अपने लक्षणों का वर्णन करें..." },
  { lang: "ਪੰਜਾਬੀ", heading: "ਆਰੋਗਿਆ ਮਿੱਤਰ AI", placeholder: "ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ..." },
  { lang: "বাংলা", heading: "আরোগ্য মিত্র AI", placeholder: "আপনার উপসর্গ বর্ণনা করুন..." },
  { lang: "मराठी", heading: "आरोग्य मित्र AI", placeholder: "तुमच्या लक्षणांचे वर्णन करा..." },
]

const URGENCY_CONFIG = {
  low:       { color: "bg-green-900/40 border-green-600",  text: "text-green-300",  icon: "✅", label: "Low — Manageable at Home" },
  medium:    { color: "bg-yellow-900/40 border-yellow-600", text: "text-yellow-300", icon: "⚠️", label: "Medium — Monitor Carefully" },
  high:      { color: "bg-orange-900/40 border-orange-600", text: "text-orange-300", icon: "🔶", label: "High — See Doctor Soon" },
  emergency: { color: "bg-red-900/40 border-red-500",       text: "text-red-300",    icon: "🚨", label: "Emergency — Go to Hospital Now!" },
}

const DOCTOR_MAP: Record<string, { name: string; phone: string; emoji: string; days: string }> = {
  "General Medicine": { name: "Dr. Rajesh Sharma",  phone: "9810001001", emoji: "🩺", days: "Mon / Wed / Fri" },
  "Pediatrics":       { name: "Dr. Priya Kaur",     phone: "9810001002", emoji: "👶", days: "Tue / Thu / Sat" },
  "Orthopedics":      { name: "Dr. Amandeep Singh", phone: "9810001003", emoji: "🦴", days: "Mon / Thu" },
  "Gynecology":       { name: "Dr. Sunita Devi",    phone: "9810001004", emoji: "🌸", days: "Mon – Fri" },
  "Dermatology":      { name: "Dr. Vikram Patel",   phone: "9810001005", emoji: "🧴", days: "Wed / Fri / Sat" },
  "ENT":              { name: "Dr. Meena Kumari",   phone: "9810001006", emoji: "👂", days: "Tue / Thu / Sat" },
}

interface AIResult {
  urgency: keyof typeof URGENCY_CONFIG
  urgency_message: string
  likely_condition: string
  symptom_analysis: string
  precautions: string[]
  home_remedies: string[]
  dos: string[]
  donts: string[]
  diet_advice: string
  when_to_see_doctor: string
  specialist: string
  summary: string
}

export default function HealthCheck() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<AIResult | null>(null)
  const [fallback, setFallback] = useState("")
  const [loading, setLoading] = useState(false)
  const [langIndex, setLangIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceLang, setVoiceLang] = useState("hi-IN")
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setLangIndex(i => (i + 1) % translations.length), 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) setVoiceSupported(true)
  }, [])

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = voiceLang
    rec.interimResults = true
    rec.continuous = true
    rec.onresult = (e: any) => {
      let t = ""
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setInput(t)
    }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setFallback("")

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      })
      const data = await res.json()
      if (data.structured) {
        setResult(data.structured)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      } else {
        setFallback(data.response || "No response available.")
      }
    } catch {
      setFallback("Could not reach AarogyaMitra AI. Please check if the backend is running.")
    }
    setLoading(false)
  }

  const urgency = result ? (URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.low) : null
  const doctor = result ? (DOCTOR_MAP[result.specialist] || DOCTOR_MAP["General Medicine"]) : null

  return (
    <>
      <div className="relative z-10 min-h-screen bg-black text-white">
        <Navbar />
        <section className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{translations[langIndex].heading}</h1>
            <p className="text-gray-400 text-sm">AI-powered symptom analysis • Rural Health Assistant • Nabha, Punjab</p>
          </div>

          {/* Input Card */}
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-700 mb-6">
            {voiceSupported && (
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={voiceLang}
                  onChange={e => setVoiceLang(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs"
                >
                  <option value="hi-IN">🇮🇳 Hindi</option>
                  <option value="pa-IN">🇮🇳 Punjabi</option>
                  <option value="en-IN">🇮🇳 English</option>
                  <option value="bn-IN">🇮🇳 Bengali</option>
                  <option value="mr-IN">🇮🇳 Marathi</option>
                  <option value="ta-IN">🇮🇳 Tamil</option>
                  <option value="gu-IN">🇮🇳 Gujarati</option>
                </select>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isListening ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isListening ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Speak Symptoms</>}
                </button>
                {isListening && (
                  <span className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> Listening...
                  </span>
                )}
              </div>
            )}

            <textarea
              className="w-full h-28 sm:h-36 p-3 border border-gray-600 rounded-xl text-sm bg-gray-800 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-green-500 transition"
              placeholder={translations[langIndex].placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
            />

            <Button
              className="w-full mt-3 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-base transition-all"
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing symptoms...
                </span>
              ) : "🩺 Analyze Symptoms"}
            </Button>
          </div>

          {/* Fallback plain text */}
          {fallback && (
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap mb-6">
              {fallback}
            </div>
          )}

          {/* Structured AI Result */}
          {result && urgency && doctor && (
            <div ref={resultRef} className="space-y-4">

              {/* Urgency Banner */}
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${urgency.color}`}>
                <span className="text-3xl">{urgency.icon}</span>
                <div>
                  <p className={`font-bold text-base ${urgency.text}`}>{urgency.label}</p>
                  <p className="text-gray-300 text-sm mt-0.5">{result.urgency_message}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Stethoscope size={12} /> Likely Condition</p>
                <p className="text-xl font-bold text-white mb-2">{result.likely_condition}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{result.symptom_analysis}</p>
              </div>

              {/* 2-col: Precautions + Home Remedies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-2xl border border-yellow-700/40 p-4">
                  <p className="text-yellow-300 font-semibold text-sm mb-3 flex items-center gap-1.5"><AlertTriangle size={14} /> Precautions</p>
                  <ul className="space-y-2">
                    {result.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-2xl border border-green-700/40 p-4">
                  <p className="text-green-300 font-semibold text-sm mb-3 flex items-center gap-1.5"><Leaf size={14} /> Home Remedies</p>
                  <ul className="space-y-2">
                    {result.home_remedies.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">🌿</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-2xl border border-blue-700/40 p-4">
                  <p className="text-blue-300 font-semibold text-sm mb-3 flex items-center gap-1.5"><CheckCircle size={14} /> Do's</p>
                  <ul className="space-y-2">
                    {result.dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-2xl border border-red-700/40 p-4">
                  <p className="text-red-300 font-semibold text-sm mb-3 flex items-center gap-1.5"><XCircle size={14} /> Don'ts</p>
                  <ul className="space-y-2">
                    {result.donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Diet + When to see doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-2xl border border-purple-700/40 p-4">
                  <p className="text-purple-300 font-semibold text-sm mb-2 flex items-center gap-1.5"><Utensils size={14} /> Diet Advice</p>
                  <p className="text-gray-300 text-sm">{result.diet_advice}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl border border-orange-700/40 p-4">
                  <p className="text-orange-300 font-semibold text-sm mb-2 flex items-center gap-1.5"><Clock size={14} /> When to See a Doctor</p>
                  <p className="text-gray-300 text-sm">{result.when_to_see_doctor}</p>
                </div>
              </div>

              {/* Specialist Doctor Card */}
              <div className="bg-blue-900/20 border border-blue-600 rounded-2xl p-5">
                <p className="text-blue-300 font-semibold text-xs uppercase tracking-widest mb-3">💡 Recommended Specialist</p>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{doctor.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-lg">{doctor.name}</p>
                      <p className="text-blue-300 text-sm">{result.specialist} • Nabha Civil Hospital</p>
                      <p className="text-gray-400 text-xs mt-0.5">Available: {doctor.days}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/consultation")}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition flex-shrink-0"
                  >
                    📅 Book Appointment →
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">AI Summary</p>
                <p className="text-gray-200 text-sm">{result.summary}</p>
              </div>

              {/* New check button */}
              <button
                onClick={() => { setResult(null); setFallback(""); setInput("") }}
                className="w-full py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm transition"
              >
                🔄 Check New Symptoms
              </button>
            </div>
          )}

          <div className="mt-8">
            <Footer />
          </div>
        </section>
      </div>
    </>
  )
}
