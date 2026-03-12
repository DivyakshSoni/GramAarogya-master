"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, User, Stethoscope, Eye, EyeOff, Phone, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

const API = "http://127.0.0.1:5000"

type Mode = "choose" | "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("choose")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Login fields
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  // Register fields
  const [name, setName] = useState("")
  const [village, setVillage] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [age, setAge] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")

  const saveUser = (user: Record<string, string>) => {
    localStorage.setItem("gramaarogya_user", JSON.stringify(user))
  }

  const handleLogin = async () => {
    if (!phone || !password) { setError("Please enter phone and password"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Login failed"); return }
      saveUser(data.user)
      router.push(data.user.role === "doctor" ? "/doctor" : "/health-check")
    } catch {
      setError("Cannot connect to server. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name || !regPhone || !regPassword) { setError("Name, phone and password are required"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: regPhone, password: regPassword, role, village, bloodGroup, age: age ? parseInt(age) : null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Registration failed"); return }
      saveUser(data.user)
      router.push(role === "doctor" ? "/doctor" : "/health-check")
    } catch {
      setError("Cannot connect to server. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  // ── Choose Role ────────────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-green-950/20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Heart size={32} className="text-white fill-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">GramCare</h1>
          <p className="text-gray-400 text-sm mb-10">Rural TeleHealth Access System</p>

          <p className="text-gray-300 font-medium mb-4">I am a...</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setRole("patient"); setMode("login") }}
              className="bg-gray-900 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-6 text-center transition-all group"
            >
              <User size={32} className="mx-auto mb-3 text-blue-400 group-hover:scale-110 transition" />
              <p className="font-semibold text-white">Patient</p>
              <p className="text-xs text-gray-500 mt-1">Consult, check symptoms, medicines</p>
            </button>
            <button
              onClick={() => { setRole("doctor"); setMode("login") }}
              className="bg-gray-900 border-2 border-gray-700 hover:border-green-500 rounded-2xl p-6 text-center transition-all group"
            >
              <Stethoscope size={32} className="mx-auto mb-3 text-green-400 group-hover:scale-110 transition" />
              <p className="font-semibold text-white">Doctor</p>
              <p className="text-xs text-gray-500 mt-1">Manage consultations, prescriptions</p>
            </button>
          </div>

          <p className="text-gray-600 text-xs">
            Nabha Civil Hospital · Serving 173 villages
          </p>
        </div>
      </div>
    )
  }

  // ── Login Form ─────────────────────────────────────────
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-green-950/20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          <button onClick={() => setMode("choose")} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1">
            ← Back
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "doctor" ? "bg-green-600" : "bg-blue-600"}`}>
              {role === "doctor" ? <Stethoscope size={20} className="text-white" /> : <User size={20} className="text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{role} Login</h2>
              <p className="text-gray-500 text-xs">Nabha Civil Hospital</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</p>}

            <Button
              onClick={handleLogin} disabled={loading}
              className={`w-full py-6 rounded-xl font-semibold flex items-center justify-center gap-2 ${role === "doctor" ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight size={16} /></>}
            </Button>

            <p className="text-center text-gray-500 text-sm">
              Don't have an account?{" "}
              <button onClick={() => setMode("register")} className="text-blue-400 hover:text-blue-300 font-medium">
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Register Form ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-green-950/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <button onClick={() => setMode("login")} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1">
          ← Back to Login
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "doctor" ? "bg-green-600" : "bg-blue-600"}`}>
            {role === "doctor" ? <Stethoscope size={20} className="text-white" /> : <User size={20} className="text-white" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Account</h2>
            <p className="text-gray-500 text-xs capitalize">{role} · Nabha Civil Hospital</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="10-digit number"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password *</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Choose a password"
                className="w-full px-4 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {role === "patient" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Blood Group</label>
                  <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none">
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Village / Town</label>
                <input value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g. Nabha, Samana..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none" />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</p>}

          <Button
            onClick={handleRegister} disabled={loading}
            className={`w-full py-6 rounded-xl font-semibold flex items-center justify-center gap-2 ${role === "doctor" ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {loading ? "Creating account..." : <><span>Create Account</span> <ArrowRight size={16} /></>}
          </Button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-blue-400 hover:text-blue-300 font-medium">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  )
}
