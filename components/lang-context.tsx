"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Language = "en" | "hi"

interface Translation {
  // Navbar
  healthCheck: string
  consult: string
  records: string
  connect: string
  map: string
  meds: string
  pulse: string
  view: string
  team: string
  hospitalStock: string

  // Homepage Hero
  heroTitle: string
  heroSubtitle: string
  bookDoctor: string
  checkSymptoms: string

  // Homepage Stats
  statsHeading: string
  villagesServed: string
  villagesDesc: string
  doctorsAvail: string
  doctorsDesc: string
  internetAccess: string
  internetDesc: string
  peopleAffected: string
  peopleDesc: string

  // Homepage Features
  featuresHeading: string
  feat1Title: string
  feat1Desc: string
  feat2Title: string
  feat2Desc: string
  feat3Title: string
  feat3Desc: string
  feat4Title: string
  feat4Desc: string
  feat5Title: string
  feat5Desc: string
  feat6Title: string
  feat6Desc: string

  // How It Works
  howHeading: string
  step1Title: string; step1Desc: string
  step2Title: string; step2Desc: string
  step3Title: string; step3Desc: string
  step4Title: string; step4Desc: string
  step5Title: string; step5Desc: string

  // Health Check Page
  hcTitle: string
  hcSubtitle: string
  hcPlaceholder: string
  hcVoiceBtn: string
  hcAnalyse: string
  hcAnalysing: string
  hcQuickSymptoms: string
  hcUrgency: string
  hcDiagnosis: string
  hcPrecautions: string
  hcRemedies: string
  hcDos: string
  hcDonts: string
  hcDiet: string
  hcWhenDoctor: string
  hcSpecialist: string
  hcBookNow: string
  hcSummary: string

  // Consultation Page
  consultTitle: string
  consultSubtitle: string
  consultFilter: string
  consultAll: string
  consultAvailable: string
  consultQueue: string
  consultWait: string
  consultNoWait: string
  consultBookBtn: string
  consultSelectDay: string
  consultSelectTime: string
  consultYourName: string
  consultYourPhone: string
  consultSymptoms: string
  consultConfirm: string

  // Login Page
  loginTitle: string
  loginPatient: string
  loginDoctor: string
  loginPhone: string
  loginPassword: string
  loginBtn: string
  loginLoading: string

  // Medicine Stock
  stockTitle: string
  stockRefresh: string
  stockAvailable: string
  stockLow: string
  stockOut: string
  stockSearch: string
  stockInStock: string
  stockLowStock: string
  stockOutStock: string

  // Footer
  footerTagline: string
  footerSolutions: string
  footerCompany: string
  footerConnect: string

  // General
  backHome: string
  loading: string
  error: string
}

const translations: Record<Language, Translation> = {
  en: {
    // Navbar
    healthCheck: "AarogyaMitraAI",
    consult: "AarogyaConsult",
    records: "AarogyaRecords",
    connect: "AarogyaConnect",
    map: "AarogyaMap",
    meds: "AarogyaMeds",
    pulse: "AarogyaPulse",
    view: "AarogyaView",
    team: "AarogyaParivar",
    hospitalStock: "HospitalStock",

    // Homepage Hero
    heroTitle: "Your Health, Our Priority",
    heroSubtitle: "Bridging the healthcare gap for 173 villages around Nabha Civil Hospital through AI-powered telemedicine — works even offline.",
    bookDoctor: "Book a Doctor",
    checkSymptoms: "Check Symptoms",

    // Homepage Stats
    statsHeading: "The Problem We're Solving — Real Data from Nabha",
    villagesServed: "Villages Served",
    villagesDesc: "by Nabha Civil Hospital",
    doctorsAvail: "Doctors Available",
    doctorsDesc: "out of sanctioned posts",
    internetAccess: "Rural Internet",
    internetDesc: "households with access",
    peopleAffected: "People Affected",
    peopleDesc: "across rural Punjab",

    // Features
    featuresHeading: "Everything You Need, From Home",
    feat1Title: "Remote Doctor Consultation",
    feat1Desc: "Book video/audio calls with Nabha Civil Hospital doctors. No travel needed.",
    feat2Title: "Digital Health Records",
    feat2Desc: "Store prescriptions, medical history and lab reports. Access offline, share via QR.",
    feat3Title: "Medicine Availability",
    feat3Desc: "Check medicine info with AI and find nearby pharmacies — before you travel.",
    feat4Title: "AI Symptom Checker",
    feat4Desc: "Describe symptoms in Hindi or Punjabi by voice. Get instant AI health guidance.",
    feat5Title: "Works Offline",
    feat5Desc: "Installed like an app on your phone. Health records available even without internet.",
    feat6Title: "Emergency SOS",
    feat6Desc: "One tap to call ambulance (108), police (100), or Nabha Civil Hospital directly.",

    // How It Works
    howHeading: "How It Works",
    step1Title: "Register Your Profile",
    step1Desc: "Create your health profile with name, village, blood group and allergies.",
    step2Title: "Describe Symptoms",
    step2Desc: "Speak or type your symptoms in Hindi/Punjabi. AI gives instant guidance.",
    step3Title: "Book a Doctor",
    step3Desc: "Pick from 11 available doctors at Nabha Civil Hospital and book a video call.",
    step4Title: "Consult Remotely",
    step4Desc: "Join your video consultation from home. Doctor updates your records directly.",
    step5Title: "Collect Medicines",
    step5Desc: "See which pharmacies near you have your prescribed medicines in stock.",

    // Health Check
    hcTitle: "AarogyaMitra AI",
    hcSubtitle: "Describe your symptoms — get instant AI health guidance in your language",
    hcPlaceholder: "Describe your symptoms... (e.g. fever, headache, cough for 3 days)",
    hcVoiceBtn: "Speak",
    hcAnalyse: "Analyse Symptoms",
    hcAnalysing: "Analysing...",
    hcQuickSymptoms: "Quick Symptoms",
    hcUrgency: "Urgency Level",
    hcDiagnosis: "Likely Condition",
    hcPrecautions: "Precautions",
    hcRemedies: "Home Remedies",
    hcDos: "Do's",
    hcDonts: "Don'ts",
    hcDiet: "Diet Advice",
    hcWhenDoctor: "When to See Doctor",
    hcSpecialist: "Recommended Specialist",
    hcBookNow: "Book Appointment",
    hcSummary: "AI Summary",

    // Consultation
    consultTitle: "Book a Doctor",
    consultSubtitle: "11 doctors available at Nabha Civil Hospital — consult from home",
    consultFilter: "Filter",
    consultAll: "All Doctors",
    consultAvailable: "Available Today",
    consultQueue: "patients waiting",
    consultWait: "min wait",
    consultNoWait: "No waiting",
    consultBookBtn: "Book Appointment",
    consultSelectDay: "Select Day",
    consultSelectTime: "Select Time",
    consultYourName: "Your Name",
    consultYourPhone: "Your Phone",
    consultSymptoms: "Symptoms / Reason for Visit",
    consultConfirm: "Confirm Booking",

    // Login
    loginTitle: "Rural TeleHealth Access System",
    loginPatient: "Patient",
    loginDoctor: "Doctor",
    loginPhone: "Phone Number",
    loginPassword: "Password",
    loginBtn: "Login",
    loginLoading: "Logging in...",

    // Medicine Stock
    stockTitle: "Nabha Civil Hospital",
    stockRefresh: "Refresh Stock",
    stockAvailable: "Available",
    stockLow: "Low Stock",
    stockOut: "Out of Stock",
    stockSearch: "Search medicine name...",
    stockInStock: "In Stock",
    stockLowStock: "Low Stock",
    stockOutStock: "Out of Stock",

    // Footer
    footerTagline: "Revolutionizing Rural Healthcare",
    footerSolutions: "Solutions",
    footerCompany: "Company",
    footerConnect: "Connect",

    // General
    backHome: "Back to Home",
    loading: "Loading...",
    error: "Something went wrong. Please try again.",
  },

  hi: {
    // Navbar
    healthCheck: "स्वास्थ्य जाँच",
    consult: "परामर्श",
    records: "रिकॉर्ड",
    connect: "डॉक्टर खोजें",
    map: "नक्शा",
    meds: "दवाइयाँ",
    pulse: "स्वास्थ्य समाचार",
    view: "स्वास्थ्य दृष्टि",
    team: "हमारी टीम",
    hospitalStock: "अस्पताल स्टॉक",

    // Homepage Hero
    heroTitle: "आपका स्वास्थ्य, हमारी जिम्मेदारी",
    heroSubtitle: "नभा सिविल अस्पताल के आसपास 173 गांवों के लिए AI टेलीमेडिसिन — बिना इंटरनेट भी काम करता है।",
    bookDoctor: "डॉक्टर बुक करें",
    checkSymptoms: "लक्षण जाँचें",

    // Homepage Stats
    statsHeading: "हम जो समस्या हल कर रहे हैं — नभा के असली आंकड़े",
    villagesServed: "गाँव सेवित",
    villagesDesc: "नभा सिविल अस्पताल द्वारा",
    doctorsAvail: "उपलब्ध डॉक्टर",
    doctorsDesc: "स्वीकृत पदों में से",
    internetAccess: "ग्रामीण इंटरनेट",
    internetDesc: "घरों में पहुँच",
    peopleAffected: "प्रभावित लोग",
    peopleDesc: "पंजाब के ग्रामीण क्षेत्र में",

    // Features
    featuresHeading: "घर से सब कुछ सुलभ",
    feat1Title: "डॉक्टर से ऑनलाइन परामर्श",
    feat1Desc: "नभा सिविल अस्पताल के डॉक्टरों से वीडियो/ऑडियो कॉल करें। यात्रा की जरूरत नहीं।",
    feat2Title: "डिजिटल स्वास्थ्य रिकॉर्ड",
    feat2Desc: "पर्चे, मेडिकल इतिहास, लैब रिपोर्ट सुरक्षित करें। ऑफलाइन देखें, QR से साझा करें।",
    feat3Title: "दवा उपलब्धता",
    feat3Desc: "AI से दवा की जानकारी पाएं और नजदीकी फार्मेसी खोजें — यात्रा से पहले।",
    feat4Title: "AI लक्षण जाँचक",
    feat4Desc: "हिंदी या पंजाबी में बोलकर लक्षण बताएं। तुरंत AI स्वास्थ्य सलाह पाएं।",
    feat5Title: "ऑफलाइन काम करता है",
    feat5Desc: "फोन पर ऐप की तरह इंस्टॉल करें। बिना इंटरनेट भी स्वास्थ्य रिकॉर्ड उपलब्ध।",
    feat6Title: "आपातकालीन SOS",
    feat6Desc: "एक टैप में एम्बुलेंस (108), पुलिस (100) या नभा सिविल अस्पताल को कॉल करें।",

    // How It Works
    howHeading: "यह कैसे काम करता है",
    step1Title: "प्रोफाइल बनाएं",
    step1Desc: "नाम, गाँव, रक्त समूह और एलर्जी के साथ स्वास्थ्य प्रोफाइल बनाएं।",
    step2Title: "लक्षण बताएं",
    step2Desc: "हिंदी/पंजाबी में बोलकर या टाइप करके लक्षण बताएं। AI तुरंत मार्गदर्शन देगा।",
    step3Title: "डॉक्टर बुक करें",
    step3Desc: "नभा सिविल अस्पताल के 11 उपलब्ध डॉक्टरों में से चुनें और वीडियो कॉल बुक करें।",
    step4Title: "घर से परामर्श करें",
    step4Desc: "घर से वीडियो परामर्श में जुड़ें। डॉक्टर सीधे आपके रिकॉर्ड अपडेट करेगा।",
    step5Title: "दवाएं लें",
    step5Desc: "देखें कि आपके नजदीक किस फार्मेसी में आपकी दवाएं उपलब्ध हैं।",

    // Health Check
    hcTitle: "आरोग्यमित्र AI",
    hcSubtitle: "अपने लक्षण बताएं — अपनी भाषा में तुरंत AI स्वास्थ्य सलाह पाएं",
    hcPlaceholder: "अपने लक्षण बताएं... (जैसे बुखार, सिरदर्द, 3 दिनों से खांसी)",
    hcVoiceBtn: "बोलें",
    hcAnalyse: "लक्षण विश्लेषण करें",
    hcAnalysing: "विश्लेषण हो रहा है...",
    hcQuickSymptoms: "सामान्य लक्षण",
    hcUrgency: "तात्कालिकता स्तर",
    hcDiagnosis: "संभावित स्थिति",
    hcPrecautions: "सावधानियाँ",
    hcRemedies: "घरेलू उपाय",
    hcDos: "क्या करें",
    hcDonts: "क्या न करें",
    hcDiet: "आहार सलाह",
    hcWhenDoctor: "डॉक्टर कब दिखाएं",
    hcSpecialist: "अनुशंसित विशेषज्ञ",
    hcBookNow: "अपॉइंटमेंट बुक करें",
    hcSummary: "AI सारांश",

    // Consultation
    consultTitle: "डॉक्टर बुक करें",
    consultSubtitle: "नभा सिविल अस्पताल में 11 डॉक्टर उपलब्ध — घर से परामर्श करें",
    consultFilter: "फ़िल्टर",
    consultAll: "सभी डॉक्टर",
    consultAvailable: "आज उपलब्ध",
    consultQueue: "मरीज प्रतीक्षा में",
    consultWait: "मिनट प्रतीक्षा",
    consultNoWait: "कोई प्रतीक्षा नहीं",
    consultBookBtn: "अपॉइंटमेंट बुक करें",
    consultSelectDay: "दिन चुनें",
    consultSelectTime: "समय चुनें",
    consultYourName: "आपका नाम",
    consultYourPhone: "आपका फोन",
    consultSymptoms: "लक्षण / मिलने का कारण",
    consultConfirm: "बुकिंग की पुष्टि करें",

    // Login
    loginTitle: "ग्रामीण टेलीहेल्थ सेवा",
    loginPatient: "मरीज",
    loginDoctor: "डॉक्टर",
    loginPhone: "फोन नंबर",
    loginPassword: "पासवर्ड",
    loginBtn: "लॉगिन करें",
    loginLoading: "लॉगिन हो रहा है...",

    // Medicine Stock
    stockTitle: "नभा सिविल अस्पताल",
    stockRefresh: "स्टॉक रिफ्रेश करें",
    stockAvailable: "उपलब्ध",
    stockLow: "कम स्टॉक",
    stockOut: "स्टॉक खत्म",
    stockSearch: "दवा का नाम खोजें...",
    stockInStock: "उपलब्ध",
    stockLowStock: "कम स्टॉक",
    stockOutStock: "स्टॉक खत्म",

    // Footer
    footerTagline: "ग्रामीण स्वास्थ्य सेवा में क्रांति",
    footerSolutions: "सेवाएं",
    footerCompany: "कंपनी",
    footerConnect: "संपर्क करें",

    // General
    backHome: "होम पर वापस जाएं",
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हुआ। कृपया फिर से कोशिश करें।",
  },
}

interface LangContextType {
  lang: Language
  setLang: (l: Language) => void
  t: Translation
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en")
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
