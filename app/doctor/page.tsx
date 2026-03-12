"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Video, Phone, Calendar, Clock, User, Stethoscope, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"

const API = "http://127.0.0.1:5000"

// Demo appointments shown when no DB data (for hackathon demo without backend)
const DEMO_APPOINTMENTS = [
  { id: "demo-1", patient_name: "Ramesh Kumar",   symptoms: "Fever and cough for 3 days", day: "Thursday", time: "10:00 AM", status: "Scheduled", doctor_name: "Dr. Rajesh Sharma",  specialization: "General Medicine" },
  { id: "demo-2", patient_name: "Sunita Devi",    symptoms: "Chest congestion",           day: "Thursday", time: "11:00 AM", status: "Scheduled", doctor_name: "Dr. Priya Kaur",     specialization: "Pediatrics" },
  { id: "demo-3", patient_name: "Gurpreet Singh", symptoms: "Knee pain",                  day: "Thursday", time: "02:00 PM", status: "Scheduled", doctor_name: "Dr. Rajesh Sharma",  specialization: "General Medicine" },
]

interface Appointment {
  id: string
  patient_name: string
  symptoms: string
  day: string
  time: string
  status: string
  doctor_name: string
  specialization: string
}

// Same deterministic formula as consultation/page.tsx
function getJitsiRoom(doctorName: string, patientName: string, day: string, time: string) {
  const doc = doctorName.replace(/[^a-zA-Z]/g, "")
  const pat = patientName.replace(/[^a-zA-Z]/g, "")
  const slot = day.replace(/[^a-zA-Z]/g, "") + time.replace(/[^a-zA-Z0-9]/g, "")
  return `GramAarogya-${doc}-${pat}-${slot}`
}

export default function DoctorPortal() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<{ name: string; id: string; specialization?: string } | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCall, setActiveCall] = useState<Appointment | null>(null)
  const [callType, setCallType] = useState<"video" | "audio">("video")
  const [inCall, setInCall] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const sessionRaw = localStorage.getItem("gramaarogya_user")
    if (sessionRaw) {
      const u = JSON.parse(sessionRaw)
      setDoctor({ name: u.name, id: u.id, specialization: u.specialization })

      fetch(`${API}/appointments/${u.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.appointments?.length > 0) {
            setAppointments(data.appointments)
          } else {
            setAppointments(DEMO_APPOINTMENTS)
          }
        })
        .catch(() => setAppointments(DEMO_APPOINTMENTS))
        .finally(() => setLoading(false))
    } else {
      // Not logged in — show demo as guest doctor
      setDoctor({ name: "Dr. Rajesh Sharma", id: "demo", specialization: "General Medicine" })
      setAppointments(DEMO_APPOINTMENTS)
      setLoading(false)
    }
  }, [])

  const refresh = async () => {
    setRefreshing(true)
    const sessionRaw = localStorage.getItem("gramaarogya_user")
    if (sessionRaw) {
      const u = JSON.parse(sessionRaw)
      try {
        const r = await fetch(`${API}/appointments/${u.id}`)
        const data = await r.json()
        setAppointments(data.appointments?.length > 0 ? data.appointments : DEMO_APPOINTMENTS)
      } catch { setAppointments(DEMO_APPOINTMENTS) }
    }
    setRefreshing(false)
  }

  const joinCall = (appt: Appointment, type: "video" | "audio") => {
    setActiveCall(appt)
    setCallType(type)
    setInCall(true)
  }

  // ── In-call view ───────────────────────────────────────
  if (inCall && activeCall && doctor) {
    const room = getJitsiRoom(doctor.name, activeCall.patient_name, activeCall.day, activeCall.time)
    const src = `https://meet.jit.si/${room}#config.startWithVideoMuted=${callType === "audio" ? "true" : "false"}&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Stethoscope size={18} className="text-green-400" />
            <div>
              <p className="font-semibold text-sm">{activeCall.patient_name}</p>
              <p className="text-xs text-gray-400">{activeCall.symptoms || "No symptoms listed"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Connected
            </span>
          </div>
        </div>

        <div className="flex-grow relative">
          <iframe
            src={src}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ minHeight: "calc(100vh - 120px)" }}
          />
        </div>

        <div className="bg-gray-900 px-4 py-3 flex justify-center gap-3">
          <Button
            onClick={() => { setInCall(false); setActiveCall(null) }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold"
          >
            End Consultation
          </Button>
        </div>
      </div>
    )
  }

  // ── Main portal ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Doctor header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center">
              <Stethoscope size={28} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{doctor?.name || "Doctor"}</h1>
              <p className="text-gray-400 text-sm">{doctor?.specialization || "Nabha Civil Hospital"}</p>
              <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400"
              title="Refresh appointments"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { localStorage.removeItem("gramaarogya_user"); router.push("/login") }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Today's appointments */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">📋 Today's Appointments</h2>
          <span className="text-xs bg-green-900/40 text-green-300 px-3 py-1 rounded-full border border-green-800">
            {appointments.length} scheduled
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
            <Calendar size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No appointments scheduled today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt, i) => {
              const room = getJitsiRoom(doctor?.name || "Doctor", appt.patient_name, appt.day, appt.time)
              return (
                <div key={appt.id} className="bg-gray-900 border border-gray-700 hover:border-green-600 rounded-xl p-5 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{appt.patient_name}</p>
                        <p className="text-sm text-gray-400">{appt.symptoms || "No symptoms listed"}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded-full border border-green-800/50">
                      {appt.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {appt.day}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {appt.time}</span>
                  </div>

                  {/* Room info */}
                  <div className="bg-gray-800 rounded-lg px-3 py-2 mb-4 text-xs text-gray-500 font-mono truncate">
                    🔗 meet.jit.si/{room}
                  </div>

                  {/* Join buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => joinCall(appt, "video")}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Video size={16} /> Join Video Call
                    </Button>
                    <Button
                      onClick={() => joinCall(appt, "audio")}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Phone size={16} /> Audio Only
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 text-sm text-blue-200">
          <p className="font-medium mb-1">💡 How it works</p>
          <p className="text-gray-400">When a patient books an appointment and starts the call, click <strong>Join Video Call</strong> above to connect to the same room. Both patient and doctor are automatically joined to the same private session.</p>
        </div>
      </div>
    </div>
  )
}
