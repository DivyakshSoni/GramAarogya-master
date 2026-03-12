"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Search, MapPin, Pill, Clock, AlertCircle, Loader2, Building2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface MedicineInfo {
  name: string
  usage: string
  dosage: string
  sideEffects: string
  alternatives: string
  price: string
  availability: string
}

interface Pharmacy {
  name: string
  lat: number
  lng: number
  distance: number
  address: string
  mapsLink: string
}

export default function MedicineAvailability() {
  const [medicineName, setMedicineName] = useState("")
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(false)
  const [pharmacyLoading, setPharmacyLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const router = useRouter()

  const searchMedicine = async () => {
    if (!medicineName.trim()) return
    setLoading(true)
    setError("")
    setSearched(true)
    setMedicineInfo(null)

    try {
      const response = await fetch("http://127.0.0.1:5000/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine: medicineName }),
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setMedicineInfo(data.info)
      }
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.")
    }
    setLoading(false)
  }

  const NABHA_PHARMACIES: Pharmacy[] = [
    { name: "Nabha Civil Hospital Pharmacy", lat: 30.375, lng: 76.147, distance: 0.1, address: "Civil Hospital, Nabha", mapsLink: "https://maps.google.com/?q=Nabha+Civil+Hospital+Pharmacy" },
    { name: "Jan Aushadhi Kendra Nabha", lat: 30.376, lng: 76.148, distance: 0.3, address: "Near Bus Stand, Nabha", mapsLink: "https://maps.google.com/?q=Jan+Aushadhi+Kendra+Nabha" },
    { name: "Sharma Medical Store", lat: 30.374, lng: 76.146, distance: 0.5, address: "Main Bazar, Nabha", mapsLink: "https://maps.google.com/?q=Main+Bazar+Nabha+Medical" },
    { name: "Shiv Medical Hall", lat: 30.378, lng: 76.150, distance: 0.8, address: "Sanauri Adda, Nabha", mapsLink: "https://maps.google.com/?q=Shiv+Medical+Nabha" },
    { name: "Gupta Drug House", lat: 30.373, lng: 76.144, distance: 1.1, address: "Rajpura Road, Nabha", mapsLink: "https://maps.google.com/?q=Gupta+Drug+House+Nabha" },
  ]

  const findNearbyPharmacies = async () => {
    setPharmacyLoading(true)
    setPharmacies([])

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        })
      })

      const { latitude, longitude } = position.coords
      const radius = 5000

      const query = `
        [out:json][timeout:20];
        (
          node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
          way["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
          node["shop"="chemist"](around:${radius},${latitude},${longitude});
        );
        out center body;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      })

      const data = await response.json()
      const pharmacyList: Pharmacy[] = data.elements
        .map((el: any) => {
          const lat = el.lat || el.center?.lat
          const lng = el.lon || el.center?.lon
          if (!lat || !lng) return null
          const distance = getDistance(latitude, longitude, lat, lng)
          return {
            name: el.tags?.name || "Pharmacy / Medical Store",
            lat, lng, distance,
            address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "Nearby",
            mapsLink: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
          }
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 10)

      setPharmacies(pharmacyList.length > 0 ? pharmacyList : NABHA_PHARMACIES)
    } catch {
      // Geolocation denied or API failed — show known Nabha pharmacies
      setPharmacies(NABHA_PHARMACIES)
    }
    setPharmacyLoading(false)
  }

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* Header */}
      <div className="bg-black py-6 px-4 shadow-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">💊 Medicine Availability</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Search for medicine information and find nearby pharmacies
          </p>
        </div>
      </div>

      <div className="flex-grow px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Search Bar */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <label className="block text-sm font-medium mb-2 text-gray-300">Enter Medicine Name</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Pill size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchMedicine()}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  placeholder="e.g. Paracetamol, Amoxicillin, Metformin..."
                />
              </div>
              <Button
                onClick={searchMedicine}
                disabled={loading || !medicineName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-semibold flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Search
              </Button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500">Common:</span>
              {["Paracetamol", "Amoxicillin", "ORS", "Cetirizine", "Metformin", "Ibuprofen"].map((med) => (
                <button
                  key={med}
                  onClick={() => { setMedicineName(med); }}
                  className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition"
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin mx-auto text-blue-400 mb-3" />
              <p className="text-gray-400">Fetching medicine information...</p>
            </div>
          )}

          {/* Medicine Info */}
          {medicineInfo && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-green-900/30 px-5 py-3 border-b border-gray-700">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Pill size={20} className="text-green-400" />
                  {medicineInfo.name}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Usage</h3>
                  <p className="text-sm">{medicineInfo.usage}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Dosage</h3>
                  <p className="text-sm">{medicineInfo.dosage}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Side Effects</h3>
                  <p className="text-sm text-yellow-300">{medicineInfo.sideEffects}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Alternatives</h3>
                  <p className="text-sm text-blue-300">{medicineInfo.alternatives}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1">Approx. Price</h3>
                    <p className="text-green-400 font-semibold">{medicineInfo.price}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1">Availability</h3>
                    <p className="text-blue-400 font-semibold">{medicineInfo.availability}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Find Nearby Pharmacies — always visible */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 size={20} className="text-blue-400" />
                Nearby Pharmacies
              </h3>
              <Button
                onClick={findNearbyPharmacies}
                disabled={pharmacyLoading}
                className="bg-green-600 hover:bg-green-700 text-sm flex items-center gap-1"
              >
                {pharmacyLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                Find Pharmacies
              </Button>
            </div>

            {pharmacyLoading && (
              <div className="text-center py-6">
                <Loader2 size={24} className="animate-spin mx-auto text-green-400 mb-2" />
                <p className="text-gray-400 text-sm">Finding nearby pharmacies...</p>
              </div>
            )}

            {!pharmacyLoading && pharmacies.length > 0 && (
              <div className="space-y-2">
                {pharmacies.map((pharmacy, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center text-green-300 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{pharmacy.name}</p>
                        <p className="text-xs text-gray-500">{pharmacy.address} • {pharmacy.distance.toFixed(1)} km away</p>
                      </div>
                    </div>
                    <a
                      href={pharmacy.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      <MapPin size={12} /> Directions
                    </a>
                  </div>
                ))}
              </div>
            )}

            {!pharmacyLoading && pharmacies.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-1">📍 Click <strong className="text-gray-300">Find Pharmacies</strong> above</p>
                <p className="text-gray-600 text-xs">Works with or without GPS — shows Nabha pharmacies as fallback</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Back to Home */}
      <div className="bg-black pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" className="hover:bg-[#b9b9b9]" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
