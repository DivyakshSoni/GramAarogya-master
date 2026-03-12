"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Place {
  name: string
  vicinity: string
  lat: number
  lng: number
  distance: number
  mapsLink: string
  type: string
}

interface MapProps {
  center: { lat: number; lng: number }
  places: Place[]
}

// Fix default marker icon issue in Leaflet + Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function LeafletMap({ center, places }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 14)

      // Add OpenStreetMap tiles (completely free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Add user location marker (red)
    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup("<b>📍 Your Location</b>")

    // Add place markers (blue)
    places.forEach((place) => {
      L.marker([place.lat, place.lng], { icon: defaultIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<b>${place.name}</b><br/>
           <span style="color:#666">${place.vicinity}</span><br/>
           <span style="color:#888">${place.distance.toFixed(2)} km away</span><br/>
           <a href="${place.mapsLink}" target="_blank" style="color:#3b82f6">View on Map</a>`
        )
    })

    // Fit bounds to show all markers
    if (places.length > 0) {
      const bounds = L.latLngBounds([
        [center.lat, center.lng],
        ...places.map((p) => [p.lat, p.lng] as [number, number]),
      ])
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {}
  }, [center, places])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
}
