"use client"

import { useState, useEffect } from "react"
import { Phone, X, MapPin, AlertTriangle, Loader2 } from "lucide-react"

const EMERGENCY_NUMBERS = [
  { name: "Ambulance / Emergency", number: "108", icon: "🚑" },
  { name: "Police", number: "100", icon: "👮" },
  { name: "Fire Brigade", number: "101", icon: "🚒" },
  { name: "Women Helpline", number: "1091", icon: "🆘" },
  { name: "Nabha Civil Hospital", number: "01765-220033", icon: "🏥" },
  { name: "National Health Helpline", number: "104", icon: "💊" },
]

export default function EmergencySOS() {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [pulsing, setPulsing] = useState(true)

  // Stop pulse after 5 seconds so it's not distracting
  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  const openHospitalMap = () => {
    if (location) {
      window.open(
        `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=14/${location.lat}/${location.lng}`,
        "_blank"
      )
    } else {
      // Default to Nabha
      window.open("https://maps.google.com/?q=Nabha+Civil+Hospital+Punjab", "_blank")
    }
  }

  return (
    <>
      {/* Floating SOS Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {!open && (
          <button
            onClick={() => { setOpen(true); getLocation() }}
            className={`w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-2xl flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-110 ${
              pulsing ? "animate-pulse" : ""
            }`}
            aria-label="Emergency SOS"
          >
            <AlertTriangle size={20} />
            <span className="text-xs font-bold leading-none">SOS</span>
          </button>
        )}
      </div>

      {/* SOS Modal */}
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-950 border border-red-800 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-red-700 rounded-t-2xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={22} className="text-white" />
                <h2 className="text-white font-bold text-lg">Emergency Help</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Location */}
            <div className="px-5 py-3 border-b border-gray-800">
              {locating ? (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Getting your location...
                </div>
              ) : location ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <MapPin size={14} />
                    Location detected • Share with emergency services
                  </div>
                  <button
                    onClick={openHospitalMap}
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-full"
                  >
                    View Map
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Location unavailable</span>
                  <button
                    onClick={openHospitalMap}
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <MapPin size={12} /> Open Hospital Map
                  </button>
                </div>
              )}
            </div>

            {/* Emergency Numbers */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">
                Tap to Call
              </p>
              {EMERGENCY_NUMBERS.map((service) => (
                <a
                  key={service.number}
                  href={`tel:${service.number}`}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 transition group"
                >
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-grow">
                    <p className="text-white font-medium text-sm">{service.name}</p>
                    <p className="text-red-400 font-bold text-lg leading-tight">{service.number}</p>
                  </div>
                  <Phone size={18} className="text-green-400 group-hover:scale-110 transition" />
                </a>
              ))}
            </div>

            {/* Patient QR */}
            <div className="px-4 pb-4">
              <button
                onClick={() => {
                  const profile = localStorage.getItem("patientProfile")
                  if (profile) {
                    const p = JSON.parse(profile)
                    const info = `EMERGENCY PATIENT INFO\nName: ${p.name}\nAge: ${p.age}\nBlood: ${p.bloodGroup}\nAllergies: ${p.allergies}\nPhone: ${p.emergencyContact}`
                    const qr = encodeURIComponent(info)
                    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}`, "_blank")
                  } else {
                    window.location.href = "/health-records"
                  }
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                🪪 Show Patient QR Code for Hospital
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
