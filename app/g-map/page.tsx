"use client"

import { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  ),
})

interface Place {
  name: string
  vicinity: string
  lat: number
  lng: number
  distance: number
  mapsLink: string
  type: string
}

export default function GMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<string>("all")
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          fetchNearbyPlaces(lat, lng, selectedFacility)
        },
        () => setError("Location access denied. Please allow location access and refresh."),
        { enableHighAccuracy: true },
      )
    } else {
      setError("Geolocation is not supported by your browser.")
    }
  }, [])

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location.lat, location.lng, selectedFacility)
    }
  }, [selectedFacility])

  const fetchNearbyPlaces = async (lat: number, lng: number, facilityType: string) => {
    setLoading(true)
    try {
      // Build Overpass API query to find hospitals/clinics nearby (5km radius)
      let amenityFilter = ""
      switch (facilityType) {
        case "public":
          amenityFilter = '["amenity"="hospital"]["operator:type"~"government|public",i]'
          break
        case "private":
          amenityFilter = '["amenity"="hospital"]["operator:type"~"private",i]'
          break
        case "clinic":
          amenityFilter = '["amenity"="clinic"]'
          break
        case "medical":
          amenityFilter = '["amenity"~"pharmacy|doctors|dentist"]'
          break
        default:
          amenityFilter = '["amenity"~"hospital|clinic|doctors|pharmacy"]'
          break
      }

      const overpassQuery = `
        [out:json][timeout:10];
        (
          node${amenityFilter}(around:5000,${lat},${lng});
          way${amenityFilter}(around:5000,${lat},${lng});
        );
        out center body 20;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      const data = await response.json()

      const results: Place[] = data.elements
        .map((element: any) => {
          const placeLat = element.lat || element.center?.lat
          const placeLng = element.lon || element.center?.lon
          if (!placeLat || !placeLng) return null

          const name = element.tags?.name || element.tags?.["name:en"] || "Medical Facility"
          const vicinity = element.tags?.["addr:full"] || element.tags?.["addr:street"] || element.tags?.["addr:city"] || "Address not available"
          const type = element.tags?.amenity || "hospital"

          return {
            name,
            vicinity,
            lat: placeLat,
            lng: placeLng,
            distance: getDistance(lat, lng, placeLat, placeLng),
            mapsLink: `https://www.openstreetmap.org/?mlat=${placeLat}&mlon=${placeLng}#map=17/${placeLat}/${placeLng}`,
            type,
          }
        })
        .filter(Boolean)
        .sort((a: Place, b: Place) => a.distance - b.distance)

      setPlaces(results)
    } catch (err) {
      console.error("Error fetching places:", err)
      setError("Failed to fetch nearby places. Please try again.")
    }
    setLoading(false)
  }

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center p-6 bg-gray-1000 text-white min-h-screen">
      <Navbar className="fixed top-0 left-0 w-full bg-black shadow-md z-50" />

      <h1 className="text-3xl font-bold mb-6 pt-20 text-white text-center">Accessible Healthcare Locations</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="facility-type" className="mr-2 text-white">
          Select Facility Type:
        </label>
        <select
          id="facility-type"
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="p-2 border border-gray-700 rounded-lg bg-black text-white"
        >
          <option value="all">All Medical Facilities</option>
          <option value="public">Public Health Center/Govt Hospitals</option>
          <option value="private">Private Health Centers</option>
          <option value="clinic">Doctor's Clinic</option>
          <option value="medical">Medical Facilities</option>
        </select>
      </div>

      {/* Map and places list */}
      <div className="flex flex-col md:flex-row w-full max-w-7xl mt-4 gap-4 sm:gap-6">
        {/* Map Section (Left) - Using Leaflet + OpenStreetMap */}
        {isMounted && location && (
          <div className="w-full md:w-[55%] h-[350px] sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden shadow-lg">
            <MapComponent center={location} places={places} />
          </div>
        )}

        {/* Places List (Right) */}
        <div className="w-full md:w-[45%] h-[350px] sm:h-[450px] md:h-[550px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Finding nearby facilities...</p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4 p-2 sm:p-4">
              {places.length === 0 && !error && (
                <li className="text-center text-gray-400 py-8">No facilities found nearby.</li>
              )}
              {places.map((place, index) => (
                <li
                  key={index}
                  className="border border-gray-700 p-3 sm:p-5 rounded-lg bg-black shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col">
                    <strong className="text-base sm:text-lg md:text-xl font-semibold text-blue-400">{place.name}</strong>
                    <p className="text-sm sm:text-base md:text-lg italic text-gray-300">{place.vicinity}</p>
                    <p className="text-xs sm:text-sm text-gray-400">{place.distance.toFixed(2)} km away</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-900 text-blue-200 rounded-full text-xs w-fit capitalize">
                      {place.type}
                    </span>

                    {/* View on OpenStreetMap Link */}
                    <a
                      href={place.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2 text-xs sm:text-sm"
                    >
                      View on Map
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer className="w-full bg-black text-gray-400 mt-10" />

      <style jsx>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
