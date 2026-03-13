"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  User, FileText, Calendar, Clock, Pill, Activity, Heart,
  Plus, Trash2, Download, QrCode, Shield, ChevronDown, ChevronUp
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface PatientProfile {
  name: string
  age: string
  gender: string
  phone: string
  village: string
  bloodGroup: string
  allergies: string
  emergencyContact: string
  registeredAt: string
}

interface HealthRecord {
  id: number
  date: string
  type: "consultation" | "prescription" | "lab_report" | "vaccination"
  doctorName: string
  diagnosis: string
  prescription: string
  notes: string
}

interface Appointment {
  id: number
  doctorName: string
  specialization: string
  hospital: string
  day: string
  time: string
  patientName: string
  patientPhone: string
  symptoms: string
  status: string
  bookedAt: string
}

export default function HealthRecords() {
  const [authChecked, setAuthChecked] = useState(false)   // ← blocks render until auth verified
  const [isRegistered, setIsRegistered] = useState(false)
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "records" | "appointments" | "profile">("overview")
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null)
  const router = useRouter()

  // Registration form state
  const [regName, setRegName] = useState("")
  const [regAge, setRegAge] = useState("")
  const [regGender, setRegGender] = useState("Male")
  const [regPhone, setRegPhone] = useState("")
  const [regVillage, setRegVillage] = useState("")
  const [regBloodGroup, setRegBloodGroup] = useState("")
  const [regAllergies, setRegAllergies] = useState("")
  const [regEmergencyContact, setRegEmergencyContact] = useState("")

  // Add record form state
  const [newRecordType, setNewRecordType] = useState<HealthRecord["type"]>("consultation")
  const [newRecordDoctor, setNewRecordDoctor] = useState("")
  const [newRecordDiagnosis, setNewRecordDiagnosis] = useState("")
  const [newRecordPrescription, setNewRecordPrescription] = useState("")
  const [newRecordNotes, setNewRecordNotes] = useState("")

  const API = "http://127.0.0.1:5000"

  // ── Auth guard — runs before first paint renders content ──────────
  useEffect(() => {
    const sessionRaw = localStorage.getItem("gramaarogya_user")

    if (!sessionRaw) {
      // No session — wipe stale data and send to login
      localStorage.removeItem("patientProfile")
      router.replace("/login")
      return
    }

    const u = JSON.parse(sessionRaw)

    // Doctor trying to access patient records → send to doctor portal
    if (u.role === "doctor") {
      router.replace("/doctor")
      return
    }

    // Valid patient session — build profile
    const existingProfileRaw = localStorage.getItem("patientProfile")
    const autoProfile: PatientProfile = existingProfileRaw
      ? JSON.parse(existingProfileRaw)
      : {
          name: u.name, age: u.age?.toString() || "", gender: "Male",
          phone: u.phone, village: u.village || "", bloodGroup: u.bloodGroup || "",
          allergies: "", emergencyContact: "", registeredAt: new Date().toISOString(),
        }

    if (!existingProfileRaw) {
      localStorage.setItem("patientProfile", JSON.stringify(autoProfile))
    }

    setProfile(autoProfile)
    setIsRegistered(true)
    setAuthChecked(true)  // ← only now allow the page to render

    // Fetch from SQLite; fall back to localStorage on failure (offline)
    const fetchFromDB = async () => {
      try {
        const [recRes, apptRes] = await Promise.all([
          fetch(`${API}/health-records/${u.id}`),
          fetch(`${API}/appointments/${u.id}`),
        ])
        if (recRes.ok) {
          const { records: dbRec } = await recRes.json()
          setRecords(dbRec.map((r: Record<string, string>) => ({
            id: r.id, date: r.date, type: (r.type || "consultation") as HealthRecord["type"],
            doctorName: r.doctor || "", diagnosis: r.details || "",
            prescription: "", notes: "",
          })))
        } else {
          const saved = localStorage.getItem("healthRecords")
          if (saved) setRecords(JSON.parse(saved))
        }
        if (apptRes.ok) {
          const { appointments: dbAppt } = await apptRes.json()
          setAppointments(dbAppt.map((a: Record<string, string>) => ({
            id: a.id, doctorName: a.doctor_name, specialization: a.specialization,
            hospital: a.hospital, day: a.day, time: a.time,
            patientName: a.patient_name, patientPhone: "",
            symptoms: a.symptoms || "", status: a.status, bookedAt: a.booked_at,
          })))
        } else {
          const saved = localStorage.getItem("appointments")
          if (saved) setAppointments(JSON.parse(saved))
        }
      } catch {
        // Offline — use localStorage
        const savedRec = localStorage.getItem("healthRecords")
        if (savedRec) setRecords(JSON.parse(savedRec))
        const savedAppt = localStorage.getItem("appointments")
        if (savedAppt) setAppointments(JSON.parse(savedAppt))
      }
    }
    fetchFromDB()
  }, [router])

  // Block render completely until auth is confirmed
  if (!authChecked) return null


  const handleRegister = () => {
    if (!regName || !regAge || !regPhone || !regVillage) return

    const newProfile: PatientProfile = {
      name: regName,
      age: regAge,
      gender: regGender,
      phone: regPhone,
      village: regVillage,
      bloodGroup: regBloodGroup,
      allergies: regAllergies,
      emergencyContact: regEmergencyContact,
      registeredAt: new Date().toISOString(),
    }
    localStorage.setItem("patientProfile", JSON.stringify(newProfile))
    setProfile(newProfile)
    setIsRegistered(true)
  }

  const addHealthRecord = async () => {
    if (!newRecordDiagnosis) return

    const newRecord: HealthRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: newRecordType,
      doctorName: newRecordDoctor,
      diagnosis: newRecordDiagnosis,
      prescription: newRecordPrescription,
      notes: newRecordNotes,
    }

    // Try to save to SQLite, fall back to localStorage
    const sessionUser = localStorage.getItem("gramaarogya_user")
    if (sessionUser) {
      const u = JSON.parse(sessionUser)
      try {
        await fetch(`${API}/health-records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: u.id, patientName: u.name, type: newRecordType,
            doctor: newRecordDoctor, hospital: "Nabha Civil Hospital",
            details: `${newRecordDiagnosis}${newRecordPrescription ? " | Rx: " + newRecordPrescription : ""}${newRecordNotes ? " | Notes: " + newRecordNotes : ""}`,
          }),
        })
      } catch { /* offline — saved to localStorage below */ }
    }

    const updated = [newRecord, ...records]
    setRecords(updated)
    localStorage.setItem("healthRecords", JSON.stringify(updated))
    setShowAddRecord(false)
    setNewRecordDoctor("")
    setNewRecordDiagnosis("")
    setNewRecordPrescription("")
    setNewRecordNotes("")
  }

  const deleteRecord = (id: number) => {
    const updated = records.filter((r) => r.id !== id)
    setRecords(updated)
    localStorage.setItem("healthRecords", JSON.stringify(updated))
  }

  const getRecordIcon = (type: HealthRecord["type"]) => {
    switch (type) {
      case "consultation": return <Activity size={16} className="text-blue-400" />
      case "prescription": return <Pill size={16} className="text-green-400" />
      case "lab_report": return <FileText size={16} className="text-yellow-400" />
      case "vaccination": return <Shield size={16} className="text-purple-400" />
    }
  }

  const getRecordLabel = (type: HealthRecord["type"]) => {
    switch (type) {
      case "consultation": return "Consultation"
      case "prescription": return "Prescription"
      case "lab_report": return "Lab Report"
      case "vaccination": return "Vaccination"
    }
  }

  const exportHealthData = () => {
    const data = {
      profile,
      records,
      appointments,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `health-records-${profile?.name || "patient"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateQRData = () => {
    if (!profile) return ""
    const qrData = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      village: profile.village,
      phone: profile.phone,
      lastRecords: records.slice(0, 3).map(r => ({
        date: new Date(r.date).toLocaleDateString(),
        diagnosis: r.diagnosis,
        prescription: r.prescription,
      })),
    }
    return encodeURIComponent(JSON.stringify(qrData))
  }

  // Registration Screen
  if (!isRegistered) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold">Patient Registration</h1>
              <p className="text-gray-400 text-sm mt-1">Create your digital health profile</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Full Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Age *</label>
                  <input
                    type="number"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Gender</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Village/Town *</label>
                <input
                  type="text"
                  value={regVillage}
                  onChange={(e) => setRegVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  placeholder="e.g. Nabha, Village name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Blood Group</label>
                  <select
                    value={regBloodGroup}
                    onChange={(e) => setRegBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Emergency Contact</label>
                  <input
                    type="tel"
                    value={regEmergencyContact}
                    onChange={(e) => setRegEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    placeholder="Emergency phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Known Allergies</label>
                <input
                  type="text"
                  value={regAllergies}
                  onChange={(e) => setRegAllergies(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  placeholder="e.g. Penicillin, Peanuts (or None)"
                />
              </div>

              <Button
                onClick={handleRegister}
                disabled={!regName || !regAge || !regPhone || !regVillage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Register & Create Health Profile
              </Button>

              <p className="text-xs text-gray-500 text-center">
                🔒 Your data is stored securely on your device (offline accessible)
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      {/* Header */}
      <div className="bg-black py-6 px-4 shadow-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">📋 Health Records</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome, <span className="text-blue-400 font-medium">{profile?.name}</span> • {profile?.village}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportHealthData}
                variant="outline"
                className="text-xs sm:text-sm flex items-center gap-1"
              >
                <Download size={14} /> Export
              </Button>
              <Button
                onClick={() => {
                  const qr = generateQRData()
                  window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}`, "_blank")
                }}
                variant="outline"
                className="text-xs sm:text-sm flex items-center gap-1"
              >
                <QrCode size={14} /> QR Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {(["overview", "records", "appointments", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 text-sm font-medium capitalize whitespace-nowrap transition border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow px-4 py-6">
        <div className="max-w-6xl mx-auto">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                  <p className="text-2xl font-bold text-blue-400">{records.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Health Records</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                  <p className="text-2xl font-bold text-green-400">{appointments.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Appointments</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{records.filter(r => r.type === "prescription").length}</p>
                  <p className="text-xs text-gray-400 mt-1">Prescriptions</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                  <p className="text-2xl font-bold text-purple-400">{profile?.bloodGroup || "N/A"}</p>
                  <p className="text-xs text-gray-400 mt-1">Blood Group</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-sm">
                <p className="text-blue-200">
                  💡 <strong>Offline Access:</strong> Your health records are stored on this device and accessible even without internet.
                  Use the <strong>QR Code</strong> button to generate a portable health summary for hospital visits.
                </p>
              </div>

              {/* Recent Records */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Records</h3>
                {records.length === 0 ? (
                  <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
                    <FileText size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">No health records yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Add your first record or book a consultation.</p>
                    <Button onClick={() => setShowAddRecord(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <Plus size={16} className="mr-1" /> Add Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {records.slice(0, 5).map((record) => (
                      <div key={record.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getRecordIcon(record.type)}
                            <div>
                              <p className="font-medium text-sm">{record.diagnosis}</p>
                              <p className="text-xs text-gray-500">
                                {getRecordLabel(record.type)} • {new Date(record.date).toLocaleDateString()} • {record.doctorName || "Self-reported"}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}>
                            {expandedRecord === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                        {expandedRecord === record.id && (
                          <div className="mt-3 pt-3 border-t border-gray-800 text-sm space-y-1">
                            {record.prescription && <p><span className="text-gray-400">Prescription:</span> {record.prescription}</p>}
                            {record.notes && <p><span className="text-gray-400">Notes:</span> {record.notes}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === "records" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">All Health Records</h3>
                <Button onClick={() => setShowAddRecord(!showAddRecord)} className="bg-blue-600 hover:bg-blue-700 text-sm">
                  <Plus size={14} className="mr-1" /> Add Record
                </Button>
              </div>

              {/* Add Record Form */}
              {showAddRecord && (
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-700 mb-4 space-y-3">
                  <h4 className="font-semibold text-sm">New Health Record</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Record Type</label>
                      <select
                        value={newRecordType}
                        onChange={(e) => setNewRecordType(e.target.value as HealthRecord["type"])}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="prescription">Prescription</option>
                        <option value="lab_report">Lab Report</option>
                        <option value="vaccination">Vaccination</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Doctor Name</label>
                      <input
                        type="text"
                        value={newRecordDoctor}
                        onChange={(e) => setNewRecordDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                        placeholder="Doctor's name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Diagnosis / Description *</label>
                    <input
                      type="text"
                      value={newRecordDiagnosis}
                      onChange={(e) => setNewRecordDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                      placeholder="e.g. Fever, Common Cold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prescription / Medicines</label>
                    <input
                      type="text"
                      value={newRecordPrescription}
                      onChange={(e) => setNewRecordPrescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                      placeholder="e.g. Paracetamol 500mg, 3 times daily"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Notes</label>
                    <textarea
                      value={newRecordNotes}
                      onChange={(e) => setNewRecordNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm h-16"
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addHealthRecord} disabled={!newRecordDiagnosis} className="bg-green-600 hover:bg-green-700 text-sm">
                      Save Record
                    </Button>
                    <Button onClick={() => setShowAddRecord(false)} variant="outline" className="text-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Records List */}
              {records.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
                  <p className="text-gray-400">No records found. Add your first health record above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {records.map((record) => (
                    <div key={record.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRecordIcon(record.type)}
                          <div>
                            <p className="font-medium text-sm">{record.diagnosis}</p>
                            <p className="text-xs text-gray-500">
                              {getRecordLabel(record.type)} • {new Date(record.date).toLocaleDateString()} • {record.doctorName || "Self-reported"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}>
                            {expandedRecord === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => deleteRecord(record.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {expandedRecord === record.id && (
                        <div className="mt-3 pt-3 border-t border-gray-800 text-sm space-y-1">
                          {record.prescription && <p><span className="text-gray-400">Prescription:</span> {record.prescription}</p>}
                          {record.notes && <p><span className="text-gray-400">Notes:</span> {record.notes}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Appointments</h3>
                <Button onClick={() => router.push("/consultation")} className="bg-blue-600 hover:bg-blue-700 text-sm">
                  <Plus size={14} className="mr-1" /> Book New
                </Button>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
                  <Calendar size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No appointments yet.</p>
                  <p className="text-gray-500 text-sm mt-1">Book a consultation with a doctor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{apt.doctorName}</p>
                          <p className="text-blue-400 text-sm">{apt.specialization}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {apt.day}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {apt.time}</span>
                          </div>
                          {apt.symptoms && <p className="text-xs text-gray-500 mt-1">Symptoms: {apt.symptoms}</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === "Scheduled" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && profile && (
            <div className="max-w-lg mx-auto">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-gray-400 text-sm">{profile.village} • Registered {new Date(profile.registeredAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Age</span><span>{profile.age} years</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Gender</span><span>{profile.gender}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Phone</span><span>{profile.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Blood Group</span><span>{profile.bloodGroup || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Allergies</span><span>{profile.allergies || "None"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Emergency Contact</span><span>{profile.emergencyContact || "Not specified"}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    localStorage.removeItem("patientProfile")
                    localStorage.removeItem("healthRecords")
                    localStorage.removeItem("appointments")
                    setIsRegistered(false)
                    setProfile(null)
                    setRecords([])
                    setAppointments([])
                  }}
                  variant="outline"
                  className="mt-6 w-full text-red-400 border-red-800 hover:bg-red-900/20"
                >
                  Reset Profile & Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Home */}
      <div className="bg-black pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" className="hover:bg-[#b9b9b9]" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
