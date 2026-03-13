"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Video, FileText, Pill, Mic, Wifi, AlertTriangle,
  ChevronRight, Heart, MapPin, Users, Building2, Activity
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLang } from "@/components/lang-context";

// ── Animated counter hook ──────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

export default function HomePage() {
  const { t, lang } = useLang();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Trigger counter when stats section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(173, 1800, statsVisible);
  const c2 = useCounter(11, 1200, statsVisible);
  const c3 = useCounter(31, 1500, statsVisible);
  const c4 = useCounter(500000, 2000, statsVisible);

  const features = [
    { icon: <Video size={28} className="text-blue-400" />, title: t.feat1Title, desc: t.feat1Desc, href: "/consultation", color: "border-blue-800 hover:border-blue-500" },
    { icon: <FileText size={28} className="text-green-400" />, title: t.feat2Title, desc: t.feat2Desc, href: "/health-records", color: "border-green-800 hover:border-green-500" },
    { icon: <Pill size={28} className="text-yellow-400" />, title: t.feat3Title, desc: t.feat3Desc, href: "/medicine", color: "border-yellow-800 hover:border-yellow-500" },
    { icon: <Mic size={28} className="text-purple-400" />, title: t.feat4Title, desc: t.feat4Desc, href: "/health-check", color: "border-purple-800 hover:border-purple-500" },
    { icon: <Wifi size={28} className="text-cyan-400" />, title: t.feat5Title, desc: t.feat5Desc, href: "/health-records", color: "border-cyan-800 hover:border-cyan-500" },
    { icon: <AlertTriangle size={28} className="text-red-400" />, title: t.feat6Title, desc: t.feat6Desc, href: "#", color: "border-red-800 hover:border-red-500" },
  ];

  const steps = [
    { num: "01", title: t.step1Title, desc: t.step1Desc, color: "text-blue-400" },
    { num: "02", title: t.step2Title, desc: t.step2Desc, color: "text-green-400" },
    { num: "03", title: t.step3Title, desc: t.step3Desc, color: "text-yellow-400" },
    { num: "04", title: t.step4Title, desc: t.step4Desc, color: "text-purple-400" },
    { num: "05", title: t.step5Title, desc: t.step5Desc, color: "text-red-400" },
  ];

  const stats = [
    { value: c1, suffix: "", label: t.villagesServed, sub: t.villagesDesc, icon: <MapPin size={20} className="text-blue-400" /> },
    { value: c2, suffix: "/23", label: t.doctorsAvail, sub: t.doctorsDesc, icon: <Users size={20} className="text-red-400" /> },
    { value: c3, suffix: "%", label: t.internetAccess, sub: t.internetDesc, icon: <Wifi size={20} className="text-yellow-400" /> },
    { value: `${(c4/1000).toFixed(0)}K+`, suffix: "", label: t.peopleAffected, sub: t.peopleDesc, icon: <Building2 size={20} className="text-green-400" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-green-950/30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
            <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
            {lang === "hi" ? "ग्रामीण टेलीहेल्थ — नभा, पंजाब" : "Rural TeleHealth Access System — Nabha, Punjab"}
          </div>

          {/* Headline */}
          <motion.h1
            key={lang}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-green-300 bg-clip-text text-transparent mb-6"
          >
            {t.heroTitle}
          </motion.h1>

          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/consultation">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-semibold rounded-xl flex items-center gap-2">
                <Video size={18} /> {t.bookDoctor}
              </Button>
            </Link>
            <Link href="/health-check">
              <Button variant="outline" className="border-gray-600 hover:border-white text-white px-8 py-6 text-base font-semibold rounded-xl flex items-center gap-2">
                <Activity size={18} /> {t.checkSymptoms}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── IMPACT STATS ────────────────────────────────── */}
      <section ref={statsRef} className="py-16 px-4 border-y border-gray-800 bg-gray-950/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase font-semibold tracking-widest mb-10">
            {t.statsHeading}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center"
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-sm font-semibold text-gray-300 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.featuresHeading}</h2>
          <p className="text-gray-400 text-center mb-10 text-sm">
            {lang === "hi" ? "6 सुविधाएं ग्रामीण भारत के लिए — पुराने फोन, हिंदी और पंजाबी में, ऑफलाइन भी" : "6 features built for rural India — works on older phones, in Hindi & Punjabi, even offline"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={f.href}>
                  <div className={`bg-gray-900 border rounded-xl p-5 h-full transition-all duration-200 cursor-pointer group ${f.color}`}>
                    <div className="mb-3">{f.icon}</div>
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                    <div className="mt-3 flex items-center text-xs text-gray-500 group-hover:text-white transition">
                      {lang === "hi" ? "और जानें" : "Learn more"} <ChevronRight size={12} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-950/60 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.howHeading}</h2>
          <p className="text-gray-400 text-center mb-12 text-sm">
            {lang === "hi" ? "लक्षण से इलाज तक — अपने गाँव से ही" : "From symptom to treatment — entirely from your village"}
          </p>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex gap-5 pb-8 relative"
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-800" />
                )}
                <div className={`w-12 h-12 rounded-full border-2 bg-gray-900 flex items-center justify-center flex-shrink-0 font-bold text-sm ${step.color} border-current`}>
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className={`font-semibold text-base mb-1 ${step.color}`}>{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-900/40 to-green-900/30 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {lang === "hi" ? "अपनी स्वास्थ्य यात्रा शुरू करें" : "Start Your Health Journey"}
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            {lang === "hi" ? "मरीज के रूप में पंजीकरण करें, डॉक्टर से परामर्श करें और अपना स्वास्थ्य प्रबंधित करें — बिल्कुल मुफ्त।" : "Register as a patient, consult a doctor, and manage your health — all for free."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/health-records">
              <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 py-5 rounded-xl flex items-center gap-2">
                <FileText size={16} /> {lang === "hi" ? "मरीज के रूप में पंजीकरण करें" : "Register as Patient"}
              </Button>
            </Link>
            <Link href="/consultation">
              <Button variant="outline" className="border-gray-500 hover:border-white text-white px-6 py-5 rounded-xl flex items-center gap-2">
                <Video size={16} /> {lang === "hi" ? "डॉक्टर खोजें" : "Find a Doctor"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
