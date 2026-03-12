"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Video, Phone, Calendar, Clock, Star, User, ChevronRight, FileText, Printer, Copy, ExternalLink } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface Doctor {
  id: number
  name: string
  specialization: string
  experience: string
  available: boolean
  availableDays: string[]
  timeSlots: string[]
  rating: number
  hospital: string
  fee: string
  image: string
  queue: number        // patients waiting right now
}

const doctors: Doctor[] = [
  { id: 1, name: "Dr. Rajesh Sharma",  specialization: "General Medicine", experience: "15 years", available: true,  availableDays: ["Monday","Wednesday","Friday"],         timeSlots: ["09:00 AM","10:00 AM","11:00 AM","02:00 PM","03:00 PM"], rating: 4.8, hospital: "Nabha Civil Hospital", fee: "₹200", image: "👨‍⚕️", queue: 3 },
  { id: 2, name: "Dr. Priya Kaur",     specialization: "Pediatrics",       experience: "10 years", available: true,  availableDays: ["Tuesday","Thursday","Saturday"],        timeSlots: ["10:00 AM","11:00 AM","12:00 PM","03:00 PM","04:00 PM"], rating: 4.9, hospital: "Nabha Civil Hospital", fee: "₹250", image: "👩‍⚕️", queue: 1 },
  { id: 3, name: "Dr. Amandeep Singh", specialization: "Orthopedics",      experience: "12 years", available: false, availableDays: ["Monday","Thursday"],                    timeSlots: ["09:00 AM","10:00 AM","02:00 PM"],              rating: 4.6, hospital: "Nabha Civil Hospital", fee: "₹300", image: "👨‍⚕️", queue: 0 },
  { id: 4, name: "Dr. Sunita Devi",    specialization: "Gynecology",       experience: "18 years", available: true,  availableDays: ["Monday","Tuesday","Wednesday","Friday"], timeSlots: ["09:00 AM","10:00 AM","11:00 AM","01:00 PM","02:00 PM"], rating: 4.7, hospital: "Nabha Civil Hospital", fee: "₹250", image: "👩‍⚕️", queue: 5 },
  { id: 5, name: "Dr. Vikram Patel",   specialization: "Dermatology",      experience: "8 years",  available: true,  availableDays: ["Wednesday","Friday","Saturday"],         timeSlots: ["10:00 AM","11:00 AM","03:00 PM","04:00 PM"],             rating: 4.5, hospital: "Nabha Civil Hospital", fee: "₹200", image: "👨‍⚕️", queue: 0 },
  { id: 6, name: "Dr. Meena Kumari",   specialization: "ENT",              experience: "14 years", available: true,  availableDays: ["Tuesday","Thursday","Saturday"],         timeSlots: ["09:00 AM","11:00 AM","02:00 PM","04:00 PM"],             rating: 4.8, hospital: "Nabha Civil Hospital", fee: "₹200", image: "👩‍⚕️", queue: 2 },
]


const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function Consultation() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [callType, setCallType] = useState<"video" | "audio">("video")
  const [filter, setFilter] = useState<string>("all")
  const [showPrescription, setShowPrescription] = useState(false)
  const [rxMedicines, setRxMedicines] = useState("Paracetamol 500mg — 1 tablet thrice daily for 3 days\nCetirizine 10mg — 1 tablet at night for 5 days")
  const [rxAdvice, setRxAdvice] = useState("Take rest. Drink plenty of water. Follow up in 5 days if symptoms persist.")
  const router = useRouter()

  const todayName = dayNames[new Date().getDay()]

  const filteredDoctors = doctors.filter((doc) => {
    if (filter === "all") return true
    if (filter === "available") return doc.available && doc.availableDays.includes(todayName)
    return doc.specialization.toLowerCase().includes(filter.toLowerCase())
  })

  const handleBooking = () => {
    if (!selectedDoctor || !selectedDay || !selectedTime || !patientName || !patientPhone) return
    setBookingConfirmed(true)

    // Save appointment to localStorage for health records
    const appointment = {
      id: Date.now(),
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      hospital: selectedDoctor.hospital,
      day: selectedDay,
      time: selectedTime,
      patientName,
      patientPhone,
      symptoms,
      status: "Scheduled",
      bookedAt: new Date().toISOString(),
    }
    const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    existingAppointments.push(appointment)
    localStorage.setItem("appointments", JSON.stringify(existingAppointments))
  }

  const startCall = (type: "video" | "audio") => {
    setCallType(type)
    setInCall(true)
  }

  const endCall = () => {
    setInCall(false)
    setShowPrescription(true)   // show prescription after call
  }

  // Deterministic Jitsi room — same name every time for same booking, so doctor can join
  const getJitsiRoomName = () => {
    const docName = selectedDoctor?.name.replace(/[^a-zA-Z]/g, "") || "Doctor"
    const patName = patientName.replace(/[^a-zA-Z]/g, "") || "Patient"
    const slot = selectedDay.replace(/[^a-zA-Z]/g, "") + selectedTime.replace(/[^a-zA-Z0-9]/g, "")
    return `GramAarogya-${docName}-${patName}-${slot}`
  }

  const getJitsiLink = () => `https://meet.jit.si/${getJitsiRoomName()}`

  // If in a call, show the Jitsi Meet interface
  if (inCall && selectedDoctor) {
    const roomName = getJitsiRoomName()
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedDoctor.image}</span>
            <div>
              <h2 className="font-semibold">{selectedDoctor.name}</h2>
              <p className="text-xs text-gray-400">{selectedDoctor.specialization} • {callType === "video" ? "Video Call" : "Audio Call"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Connected
            </span>
          </div>
        </div>

        <div className="flex-grow relative">
          <iframe
            src={`https://meet.jit.si/${roomName}#config.startWithAudioMuted=${callType === "video" ? "false" : "false"}&config.startWithVideoMuted=${callType === "audio" ? "true" : "false"}&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ minHeight: "calc(100vh - 120px)" }}
          />
        </div>

        <div className="bg-gray-900 px-4 py-3 flex justify-center">
          <Button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold"
          >
            End Consultation
          </Button>
        </div>
      </div>
    )
  }

  // After call ends — show prescription
  if (showPrescription && selectedDoctor) {
    const rxDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            <h2 className="font-semibold">Digital Prescription</h2>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg">
            <Printer size={14} /> Print / Save
          </button>
        </div>

        <div className="max-w-xl mx-auto w-full p-6 space-y-4">
          {/* Hospital Header */}
          <div className="border border-blue-700 rounded-xl p-5 bg-blue-950/20">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🏥</span>
              <div>
                <h1 className="text-lg font-bold">Nabha Civil Hospital</h1>
                <p className="text-xs text-gray-400">Nabha, Punjab — Govt. Healthcare Facility</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-800/50 flex justify-between text-sm">
              <div>
                <p className="text-gray-400 text-xs">Doctor</p>
                <p className="font-semibold">{selectedDoctor.name}</p>
                <p className="text-blue-300 text-xs">{selectedDoctor.specialization} • {selectedDoctor.experience}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-semibold text-sm">{rxDate}</p>
                <p className="text-gray-500 text-xs">Via Teleconsultation</p>
              </div>
            </div>
          </div>

          {/* Patient */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase mb-2">Patient</p>
            <p className="font-semibold">{patientName}</p>
            <p className="text-sm text-gray-400">{patientPhone}</p>
            {symptoms && <p className="text-sm text-gray-400 mt-1">Complaint: {symptoms}</p>}
          </div>

          {/* Rx */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase mb-3 flex items-center gap-1"><span className="text-xl font-serif italic text-white">℞</span> Medicines</p>
            <textarea
              value={rxMedicines}
              onChange={e => setRxMedicines(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white resize-none"
              placeholder="Enter prescribed medicines..."
            />
          </div>

          {/* Advice */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase mb-2">Doctor's Advice</p>
            <textarea
              value={rxAdvice}
              onChange={e => setRxAdvice(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white resize-none"
            />
          </div>

          {/* Follow up */}
          <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-4 text-sm">
            <p className="text-green-300 font-medium mb-1">✅ Consultation Complete</p>
            <p className="text-gray-400">This prescription has been saved to your Health Records automatically.</p>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={() => {
              // Save prescription to health records
              const record = {
                id: Date.now(), date: new Date().toISOString(),
                type: "Prescription", doctor: selectedDoctor.name,
                hospital: selectedDoctor.hospital,
                details: `Medicines: ${rxMedicines}\n\nAdvice: ${rxAdvice}`,
              }
              const records = JSON.parse(localStorage.getItem("healthRecords") || "[]")
              records.push(record)
              localStorage.setItem("healthRecords", JSON.stringify(records))
              router.push("/health-records")
            }}>
              <FileText size={14} className="mr-1" /> Save to Records
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => {
              setShowPrescription(false)
              setBookingConfirmed(false)
              setSelectedDoctor(null)
              setSelectedDay(""); setSelectedTime(""); setPatientName(""); setPatientPhone(""); setSymptoms("")
            }}>
              New Booking
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* Header */}
      <div className="bg-black py-6 px-4 shadow-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">📞 Teleconsultation</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Consult doctors remotely via video or audio call — no travel needed
          </p>
        </div>
      </div>

      <div className="flex-grow px-4 py-6">
        <div className="max-w-6xl mx-auto">

          {/* Booking Confirmed View */}
          {bookingConfirmed && selectedDoctor ? (
            <div className="max-w-lg mx-auto">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Appointment Booked!</h2>
                <p className="text-gray-400 mb-4">Your consultation is scheduled</p>

                <div className="bg-gray-800 rounded-lg p-4 text-left space-y-2 mb-6">
                  <p><span className="text-gray-400">Doctor:</span> <span className="font-medium">{selectedDoctor.name}</span></p>
                  <p><span className="text-gray-400">Specialization:</span> <span>{selectedDoctor.specialization}</span></p>
                  <p><span className="text-gray-400">Day:</span> <span>{selectedDay}</span></p>
                  <p><span className="text-gray-400">Time:</span> <span>{selectedTime}</span></p>
                  <p><span className="text-gray-400">Patient:</span> <span>{patientName}</span></p>
                  <p><span className="text-gray-400">Fee:</span> <span className="text-green-400">{selectedDoctor.fee}</span></p>
                </div>

                {/* Share with Doctor */}
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-2">
                  <p className="text-blue-300 text-sm font-medium mb-2">📎 Share this link with the doctor to join:</p>
                  <p className="text-xs text-gray-400 break-all mb-3 font-mono bg-gray-800 px-2 py-1.5 rounded">{getJitsiLink()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(getJitsiLink()); alert("Link copied!") }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                    >
                      <Copy size={14} /> Copy Link
                    </button>
                    <button
                      onClick={() => window.open(getJitsiLink(), "_blank")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg"
                    >
                      <ExternalLink size={14} /> Open as Doctor
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => startCall("video")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Video size={20} /> Start Video Call
                  </Button>
                  <Button
                    onClick={() => startCall("audio")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Phone size={20} /> Audio Call
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setBookingConfirmed(false)
                    setSelectedDoctor(null)
                    setSelectedDay("")
                    setSelectedTime("")
                    setPatientName("")
                    setPatientPhone("")
                    setSymptoms("")
                  }}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  Book Another Consultation
                </Button>
              </div>
            </div>
          ) : selectedDoctor ? (
            /* Booking Form */
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1 text-sm"
              >
                ← Back to Doctors
              </button>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{selectedDoctor.image}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedDoctor.name}</h2>
                    <p className="text-gray-400">{selectedDoctor.specialization} • {selectedDoctor.experience}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-yellow-400">{selectedDoctor.rating}</span>
                      <span className="text-xs text-gray-500 ml-2">{selectedDoctor.fee} per consultation</span>
                    </div>
                  </div>
                </div>

                {/* Day Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Select Day</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.availableDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                          selectedDay === day
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDay && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-300">Select Time</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition flex items-center gap-1 ${
                            selectedTime === time
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                          }`}
                        >
                          <Clock size={12} /> {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Info */}
                {selectedTime && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Your Name</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Describe Symptoms (optional)</label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm h-20"
                        placeholder="Briefly describe your symptoms..."
                      />
                    </div>
                  </div>
                )}

                {/* Book Button */}
                {selectedTime && patientName && patientPhone && (
                  <Button
                    onClick={handleBooking}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} /> Confirm Booking
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Doctor List */
            <>
              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {["all", "available", "General Medicine", "Pediatrics", "Orthopedics", "Gynecology", "Dermatology", "ENT"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition capitalize ${
                      filter === f
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {f === "all" ? "All Doctors" : f === "available" ? `Available Today (${todayName})` : f}
                  </button>
                ))}
              </div>

              {/* Info Banner */}
              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 mb-6 text-center text-sm text-blue-200">
                🏥 Nabha Civil Hospital — {doctors.filter(d => d.available).length} of {doctors.length} doctors available for consultation
              </div>

              {/* Doctor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`bg-gray-900 rounded-xl p-5 border transition-all hover:shadow-lg cursor-pointer ${
                      doctor.available
                        ? "border-gray-700 hover:border-blue-500"
                        : "border-gray-800 opacity-60"
                    }`}
                    onClick={() => doctor.available && setSelectedDoctor(doctor)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{doctor.image}</span>
                        <div>
                          <h3 className="font-semibold text-base">{doctor.name}</h3>
                          <p className="text-blue-400 text-sm">{doctor.specialization}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doctor.available
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}>
                        {doctor.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-400 mb-3">
                      <p className="flex items-center gap-2"><User size={14} /> {doctor.experience}</p>
                      <p className="flex items-center gap-2"><Star size={14} className="text-yellow-400" /> {doctor.rating} rating</p>
                      <p className="flex items-center gap-2"><Calendar size={14} /> {doctor.availableDays.join(", ")}</p>
                      {/* Queue indicator */}
                      {doctor.available && (
                        <p className={`flex items-center gap-2 font-medium ${
                          doctor.queue === 0 ? "text-green-400" : doctor.queue <= 2 ? "text-yellow-400" : "text-orange-400"
                        }`}>
                          <Clock size={14} />
                          {doctor.queue === 0
                            ? "No waiting — consult now!"
                            : `${doctor.queue} in queue · ~${doctor.queue * 5} min wait`
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <span className="text-green-400 font-semibold">{doctor.fee}</span>
                      {doctor.available && (
                        <span className="text-blue-400 text-sm flex items-center gap-1">
                          Book Now <ChevronRight size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No doctors found for this filter.</p>
                  <p className="text-sm mt-1">Try selecting a different category or day.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Back to Home */}
      <div className="bg-black pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            className="hover:bg-[#b9b9b9]"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
