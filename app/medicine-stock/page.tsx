"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Search, CheckCircle2, XCircle, AlertCircle, RefreshCw, Building2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useLang } from "@/components/lang-context"

interface MedicineStock {
  name: string
  generic: string
  category: string
  quantity: number
  status: "available" | "low" | "out"
  lastUpdated: string
}

const STOCK_DATA: MedicineStock[] = [
  { name: "Paracetamol 500mg", generic: "Antipyretic / Painkiller", category: "General", quantity: 850, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Amoxicillin 500mg", generic: "Antibiotic", category: "Antibiotic", quantity: 120, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "ORS Sachet", generic: "Oral Rehydration Salt", category: "General", quantity: 600, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Cetirizine 10mg", generic: "Antihistamine / Allergy", category: "Allergy", quantity: 45, status: "low", lastUpdated: "Today 10:00 AM" },
  { name: "Metformin 500mg", generic: "Anti-diabetic", category: "Diabetes", quantity: 200, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Amlodipine 5mg", generic: "Blood Pressure", category: "Cardiovascular", quantity: 80, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Omeprazole 20mg", generic: "Antacid / Gastric", category: "Gastro", quantity: 30, status: "low", lastUpdated: "Today 10:00 AM" },
  { name: "Ibuprofen 400mg", generic: "Anti-inflammatory", category: "General", quantity: 0, status: "out", lastUpdated: "Today 06:00 AM" },
  { name: "Azithromycin 500mg", generic: "Antibiotic", category: "Antibiotic", quantity: 0, status: "out", lastUpdated: "Yesterday" },
  { name: "Iron + Folic Acid", generic: "Haematinics", category: "Maternal", quantity: 500, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Vitamin D3 60000 IU", generic: "Supplement", category: "General", quantity: 15, status: "low", lastUpdated: "Today 10:00 AM" },
  { name: "Atorvastatin 10mg", generic: "Cholesterol", category: "Cardiovascular", quantity: 160, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Salbutamol Inhaler", generic: "Bronchodilator", category: "Respiratory", quantity: 0, status: "out", lastUpdated: "2 days ago" },
  { name: "Doxycycline 100mg", generic: "Antibiotic", category: "Antibiotic", quantity: 90, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Chloroquine 250mg", generic: "Anti-malarial", category: "Malaria", quantity: 200, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Insulin (Regular)", generic: "Anti-diabetic", category: "Diabetes", quantity: 8, status: "low", lastUpdated: "Today 09:00 AM" },
  { name: "Ranitidine 150mg", generic: "Antacid", category: "Gastro", quantity: 240, status: "available", lastUpdated: "Today 10:00 AM" },
  { name: "Diclofenac 50mg", generic: "Painkiller / Anti-inflammatory", category: "General", quantity: 0, status: "out", lastUpdated: "Yesterday" },
]

const CATEGORIES = ["All", "General", "Antibiotic", "Diabetes", "Cardiovascular", "Gastro", "Allergy", "Respiratory", "Maternal", "Malaria"]

export default function MedicineStock() {
  const { t, lang } = useLang()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [lastRefreshed, setLastRefreshed] = useState("")
  const router = useRouter()

  useEffect(() => {
    setLastRefreshed(new Date().toLocaleTimeString())
  }, [])

  const filtered = STOCK_DATA.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.generic.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "All" || m.category === category
    return matchSearch && matchCat
  })

  const available = filtered.filter(m => m.status === "available").length
  const low = filtered.filter(m => m.status === "low").length
  const outOfStock = filtered.filter(m => m.status === "out").length

  const statusIcon = (status: MedicineStock["status"]) => {
    if (status === "available") return <CheckCircle2 size={16} className="text-green-400" />
    if (status === "low") return <AlertCircle size={16} className="text-yellow-400" />
    return <XCircle size={16} className="text-red-400" />
  }

  const statusBadge = (status: MedicineStock["status"]) => {
    if (status === "available") return "bg-green-900/40 text-green-300 border-green-800"
    if (status === "low") return "bg-yellow-900/40 text-yellow-300 border-yellow-800"
    return "bg-red-900/40 text-red-300 border-red-800"
  }

  const statusLabel = (status: MedicineStock["status"]) => {
    if (status === "available") return t.stockInStock
    if (status === "low") return t.stockLowStock
    return t.stockOutStock
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* Header */}
      <div className="bg-black py-6 px-4 border-b border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={20} className="text-blue-400" />
                <h1 className="text-xl sm:text-2xl font-bold">{lang === "hi" ? "नभा सिविल अस्पताल" : "Nabha Civil Hospital"}</h1>
                <span className="text-xs px-2 py-0.5 bg-green-900/40 text-green-300 border border-green-800 rounded-full">{lang === "hi" ? "लाइव" : "Live"}</span>
              </div>
              <p className="text-gray-400 text-sm">{lang === "hi" ? `फार्मेसी दवा स्टॉक — अपडेट: ${lastRefreshed}` : `Pharmacy Medicine Stock — Updated: ${lastRefreshed}`}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition"
            >
              <RefreshCw size={14} /> {t.stockRefresh}
            </button>
          </div>

          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-400">{STOCK_DATA.filter(m => m.status === "available").length}</p>
              <p className="text-xs text-gray-400">{t.stockAvailable}</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-yellow-400">{STOCK_DATA.filter(m => m.status === "low").length}</p>
              <p className="text-xs text-gray-400">{t.stockLow}</p>
            </div>
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-400">{STOCK_DATA.filter(m => m.status === "out").length}</p>
              <p className="text-xs text-gray-400">{t.stockOut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 border-b border-gray-800 bg-gray-950/50">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.stockSearch}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  category === cat
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            {lang === "hi" ? `${filtered.length} दवाएं दिख रही हैं • ${available} उपलब्ध • ${low} कम • ${outOfStock} खत्म` : `Showing ${filtered.length} medicines • ${available} available • ${low} low • ${outOfStock} out`}
          </p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="flex-grow px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-2">
            {filtered.map((med, i) => (
              <div key={i} className={`bg-gray-900 border rounded-lg p-3 sm:p-4 flex items-center gap-3 ${
                med.status === "out" ? "border-red-900/50 opacity-70" : "border-gray-800"
              }`}>
                <div className="flex-shrink-0">{statusIcon(med.status)}</div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-white">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.generic}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(med.status)}`}>
                        {statusLabel(med.status)}
                      </span>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Out of stock alert */}
          {outOfStock > 0 && (
            <div className="mt-4 bg-orange-900/20 border border-orange-800/50 rounded-lg p-4 text-sm">
              <p className="text-orange-300 font-medium mb-1">⚠️ {lang === "hi" ? `${outOfStock} दवाएं अभी स्टॉक में नहीं` : `${outOfStock} medicines currently out of stock`}</p>
              <p className="text-gray-400 text-xs">
                {lang === "hi" ? "अगर आपकी दवा यहाँ नहीं है, तो" : "If your prescribed medicine is out of stock here, use"}{" "}
                <button onClick={() => router.push("/medicine")} className="text-blue-400 underline">
                  {t.meds}
                </button>{" "}
                {lang === "hi" ? "से नजदीकी फार्मेसी में खोजें।" : "to find it at nearby pharmacies."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-black pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          <Button variant="outline" className="hover:bg-[#b9b9b9]" onClick={() => router.push("/")}>
            {t.backHome}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
