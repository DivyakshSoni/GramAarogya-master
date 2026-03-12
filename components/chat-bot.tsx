"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react"

interface Message {
  role: "user" | "bot"
  text: string
  time: string
}

const QUICK_QUESTIONS = [
  "I have fever and headache",
  "My child has stomach pain",
  "I have chest pain",
  "Book a doctor appointment",
]

function getTime() {
  if (typeof window === "undefined") return ""
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Namaste! 🙏 I'm AarogyaMitra AI. Describe your symptoms and I'll give you health advice, precautions, and home remedies in your language.",
      time: "",
    },
  ])

  // Set initial message time only on client to avoid SSR hydration mismatch
  useEffect(() => {
    setMessages(prev => [{ ...prev[0], time: getTime() }])
  }, [])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }, [open, messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", text: text.trim(), time: getTime() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      })
      const data = await res.json()

      let reply = ""
      if (data.structured) {
        const s = data.structured
        const urgMap: Record<string, string> = { low: "✅", medium: "⚠️", high: "🔶", emergency: "🚨" }
        const urg = urgMap[s.urgency as string] || "ℹ️"
        reply = `${urg} *${s.likely_condition}*\n\n${s.symptom_analysis}\n\n`
        if (s.precautions?.length) reply += `⚠️ Precautions:\n${s.precautions.slice(0, 3).map((p: string) => `• ${p}`).join("\n")}\n\n`
        if (s.home_remedies?.length) reply += `🌿 Home Remedies:\n${s.home_remedies.slice(0, 3).map((r: string) => `• ${r}`).join("\n")}\n\n`
        if (s.when_to_see_doctor) reply += `🏥 See Doctor If: ${s.when_to_see_doctor}`
      } else {
        reply = data.response || "Sorry, I couldn't process your question. Please try again."
      }

      setMessages(prev => [...prev, { role: "bot", text: reply, time: getTime() }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "⚠️ Could not reach AarogyaMitra AI. Please check if the backend is running.",
        time: getTime(),
      }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <>
      {/* Chat toggle button — sits above SOS */}
      <div className="fixed bottom-24 right-6 z-[9998] flex flex-col items-end gap-2">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 relative"
            aria-label="Open AarogyaMitra Chat"
          >
            <MessageCircle size={24} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[9998] w-[340px] sm:w-[380px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-gray-700"
          style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-blue-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">AarogyaMitra AI</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online • Nabha Civil Hospital
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-950 p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  msg.role === "bot" ? "bg-blue-700" : "bg-gray-700"
                }`}>
                  {msg.role === "bot" ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === "bot"
                    ? "bg-gray-800 text-gray-100 rounded-tl-none"
                    : "bg-blue-600 text-white rounded-tr-none"
                }`}>
                  {msg.text}
                  <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-3 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="bg-gray-900 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0 border-t border-gray-800">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-[11px] bg-gray-800 hover:bg-blue-700 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-full transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bg-gray-900 px-3 py-2.5 flex gap-2 items-end border-t border-gray-800 flex-shrink-0">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your symptoms..."
              rows={1}
              className="flex-1 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 resize-none outline-none border border-gray-700 focus:border-blue-500 placeholder-gray-500 transition max-h-24"
              style={{ minHeight: "36px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
