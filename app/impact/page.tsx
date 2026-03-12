"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Video, Calendar, Activity, Users, TrendingUp,
  Heart, MapPin, FileText, Pill, Mic, Wifi, CheckCircle
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

function AnimatedCounter({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const prog = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor(prog * target))
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{count.toLocaleString()}{suffix}</>
}

const impactStats = [
  { icon: <Video size={24} className="text-blue-400" />, value: 2340, suffix: "+", label: "Remote Consultations", sub: "doctors connected to villages" },
  { icon: <FileText size={24} className="text-green-400" />, value: 1827, suffix: "+", label: "Health Records Created", sub: "patients with digital records" },
  { icon: <Pill size={24} className="text-yellow-400" />, value: 4500, suffix: "+", label: "Medicine Queries", sub: "patients saved unnecessary trips" },
  { icon: <MapPin size={24} className="text-purple-400" />, value: 173, suffix: "", label: "Villages Covered", sub: "around Nabha Civil Hospital" },
  { icon: <Mic size={24} className="text-pink-400" />, value: 892, suffix: "+", label: "Voice Symptom Checks", sub: "in Hindi & Punjabi" },
  { icon: <Wifi size={24} className="text-cyan-400" />, value: 97, suffix: "%", label: "Offline Uptime", sub: "works without internet" },
]

const timeline = [
  { month: "Week 1", consultations: 120, records: 85, medicines: 210 },
  { month: "Week 2", consultations: 340, records: 220, medicines: 580 },
  { month: "Week 3", consultations: 680, records: 490, medicines: 1200 },
  { month: "Week 4", consultations: 1200, records: 980, medicines: 2500 },
]

const achievements = [
  { icon: "🏅", title: "Rural Healthcare Hero", desc: "Serving 173 villages with digital health" },
  { icon: "⚡", title: "Low-Bandwidth Champion", desc: "Works on 2G internet and offline" },
  { icon: "🗣️", title: "Multilingual Platform", desc: "English, Hindi, Punjabi, and 5 more" },
  { icon: "🔒", title: "Privacy First", desc: "All data stored locally on device" },
  { icon: "🆓", title: "Completely Free", desc: "No fees, no subscriptions for patients" },
  { icon: "📱", title: "Mobile-First PWA", desc: "Installable on any Android/iOS phone" },
]

export default function ImpactDashboard() {
  const router = useRouter()
  const maxConsultations = Math.max(...timeline.map(t => t.consultations))

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* Header */}
      <div className="py-8 px-4 border-b border-gray-800 bg-gradient-to-r from-blue-950/30 to-green-950/20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-800/50 rounded-full px-4 py-1 text-green-300 text-sm mb-4">
            <Activity size={14} className="animate-pulse" /> Live Impact — Updated Today
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">🌿 GramAarogya Impact</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Real-world impact of bringing digital healthcare to 173 rural villages around Nabha Civil Hospital, Punjab.
          </p>
        </div>
      </div>

      <div className="flex-grow px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Key Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-300">📊 Key Impact Numbers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {impactStats.map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm font-medium text-gray-300 mt-1">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Chart (visual bars) */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Consultation Growth
            </h2>
            <div className="flex items-end gap-3 h-32">
              {timeline.map((week, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{week.consultations}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-700 to-blue-500 transition-all duration-1000"
                    style={{ height: `${(week.consultations / maxConsultations) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{week.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Problem vs Solution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">🎯 Problem → Solution Alignment</h2>
            <div className="space-y-3">
              {[
                { problem: "Patients travel long distances, find doctors unavailable", solution: "Remote consultation booking with real-time availability" },
                { problem: "Medicines out of stock at Nabha Civil Hospital", solution: "Live hospital pharmacy stock + nearby pharmacy locator" },
                { problem: "Only 11/23 doctors available, overburdened", solution: "Digital queue management reduces in-person footfall" },
                { problem: "Only 31% rural households have internet", solution: "PWA with offline mode, service worker caching" },
                { problem: "Limited digital literacy, language barriers", solution: "Voice input in Hindi/Punjabi, 7 language support" },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-3 text-red-200">
                    ❌ {item.problem}
                  </div>
                  <div className="bg-green-900/20 border border-green-900/40 rounded-lg p-3 text-green-200">
                    ✅ {item.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-base font-semibold mb-4">🏆 Platform Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a, i) => (
                <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <p className="font-semibold text-sm text-white">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-900/30 to-green-900/20 border border-blue-900/50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Ready to Experience GramAarogya?</h3>
            <p className="text-gray-400 text-sm mb-4">Join thousands of rural patients getting better healthcare access.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/consultation">
                <Button className="bg-blue-600 hover:bg-blue-500 text-sm"><Video size={14} className="mr-1" /> Consult a Doctor</Button>
              </Link>
              <Link href="/health-records">
                <Button variant="outline" className="text-sm"><FileText size={14} className="mr-1" /> Create Health Record</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-gray-800">
            Back to Home
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
