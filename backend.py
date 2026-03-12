import os
import re
import json
import sqlite3
import hashlib
import uuid
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from langdetect import detect

load_dotenv()

# ── Groq client ────────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "gramaarogya.db")

# ── DB helpers ─────────────────────────────────────────────
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
        db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'patient',
                village TEXT,
                blood_group TEXT,
                age INTEGER,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                specialization TEXT NOT NULL,
                hospital TEXT NOT NULL,
                day TEXT NOT NULL,
                time TEXT NOT NULL,
                symptoms TEXT,
                status TEXT DEFAULT 'Scheduled',
                booked_at TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS health_records (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                type TEXT NOT NULL,
                doctor TEXT,
                hospital TEXT,
                details TEXT,
                date TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS prescriptions (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                hospital TEXT NOT NULL,
                medicines TEXT NOT NULL,
                advice TEXT,
                issued_at TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES users(id)
            );
        """)
        db.commit()
        db.close()
        print("✅ GramAarogya SQLite DB initialised at:", DB_PATH)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ── Pre-seed the 6 Nabha Civil Hospital doctors ────────────
DOCTOR_SEED = [
    {"id": "doc-001", "name": "Dr. Rajesh Sharma",  "phone": "9810001001", "specialization": "General Medicine"},
    {"id": "doc-002", "name": "Dr. Priya Kaur",     "phone": "9810001002", "specialization": "Pediatrics"},
    {"id": "doc-003", "name": "Dr. Amandeep Singh", "phone": "9810001003", "specialization": "Orthopedics"},
    {"id": "doc-004", "name": "Dr. Sunita Devi",    "phone": "9810001004", "specialization": "Gynecology"},
    {"id": "doc-005", "name": "Dr. Vikram Patel",   "phone": "9810001005", "specialization": "Dermatology"},
    {"id": "doc-006", "name": "Dr. Meena Kumari",   "phone": "9810001006", "specialization": "ENT"},
]

def seed_doctors():
    """Insert doctor accounts once at startup — skip if already present."""
    with app.app_context():
        db = sqlite3.connect(DB_PATH)
        for doc in DOCTOR_SEED:
            existing = db.execute("SELECT id FROM users WHERE id = ?", (doc["id"],)).fetchone()
            if not existing:
                db.execute(
                    "INSERT INTO users (id, name, phone, password_hash, role, village, blood_group, age, created_at) "
                    "VALUES (?,?,?,?,?,?,?,?,?)",
                    (doc["id"], doc["name"], doc["phone"],
                     hash_password("doctor123"), "doctor",
                     "Nabha Civil Hospital", "", None,
                     datetime.now().isoformat())
                )
                print(f"  ✅ Seeded doctor: {doc['name']} | phone: {doc['phone']} | pwd: doctor123")
        db.commit()
        db.close()

# ── Groq helpers ───────────────────────────────────────────
def groq_chat(system_prompt, user_message):
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        model=GROQ_MODEL,
        temperature=0.7,
        max_tokens=2048,
    )
    return chat_completion.choices[0].message.content

def remove_markdown(text):
    text = re.sub(r'\*\*.*?\*\*', '', text)
    text = re.sub(r'[\*\-] ', '', text)
    text = re.sub(r'[#\*_\[\]()]', '', text)
    text = re.sub(r'\n+', '\n', text).strip()
    return text

def format_text(text):
    sections = text.split("\n")
    return "\n\n".join(section.strip() for section in sections if section.strip())


# ══════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        password = data.get("password", "").strip()
        role = data.get("role", "patient")          # "patient" or "doctor"
        village = data.get("village", "")
        blood_group = data.get("bloodGroup", "")
        age = data.get("age", None)

        if not name or not phone or not password:
            return jsonify({"error": "Name, phone and password are required"}), 400

        db = get_db()
        existing = db.execute("SELECT id FROM users WHERE phone = ?", (phone,)).fetchone()
        if existing:
            return jsonify({"error": "Phone number already registered"}), 409

        user_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO users (id, name, phone, password_hash, role, village, blood_group, age, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            (user_id, name, phone, hash_password(password), role, village, blood_group, age, datetime.now().isoformat())
        )
        db.commit()

        return jsonify({
            "success": True,
            "user": {"id": user_id, "name": name, "phone": phone, "role": role, "village": village}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        phone = data.get("phone", "").strip()
        password = data.get("password", "").strip()

        if not phone or not password:
            return jsonify({"error": "Phone and password are required"}), 400

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE phone = ? AND password_hash = ?",
            (phone, hash_password(password))
        ).fetchone()

        if not user:
            return jsonify({"error": "Invalid phone number or password"}), 401

        return jsonify({
            "success": True,
            "user": {
                "id": user["id"], "name": user["name"],
                "phone": user["phone"], "role": user["role"],
                "village": user["village"], "bloodGroup": user["blood_group"],
                "age": user["age"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════
#  APPOINTMENTS
# ══════════════════════════════════════════════════════════

@app.route("/appointments", methods=["POST"])
def save_appointment():
    try:
        data = request.json
        appt_id = str(uuid.uuid4())
        db = get_db()
        db.execute(
            "INSERT INTO appointments (id,patient_id,patient_name,doctor_name,specialization,hospital,day,time,symptoms,status,booked_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (appt_id, data["patientId"], data["patientName"], data["doctorName"],
             data["specialization"], data["hospital"], data["day"], data["time"],
             data.get("symptoms",""), "Scheduled", datetime.now().isoformat())
        )
        db.commit()
        return jsonify({"success": True, "id": appt_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/appointments/<patient_id>", methods=["GET"])
def get_appointments(patient_id):
    try:
        db = get_db()
        rows = db.execute(
            "SELECT * FROM appointments WHERE patient_id = ? ORDER BY booked_at DESC", (patient_id,)
        ).fetchall()
        return jsonify({"appointments": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/doctor-appointments/<path:doctor_name>", methods=["GET"])
def get_doctor_appointments(doctor_name):
    """Return all appointments booked for a specific doctor (used in doctor portal)."""
    try:
        db = get_db()
        rows = db.execute(
            "SELECT * FROM appointments WHERE doctor_name = ? ORDER BY booked_at DESC",
            (doctor_name,)
        ).fetchall()
        return jsonify({"appointments": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════
#  HEALTH RECORDS
# ══════════════════════════════════════════════════════════

@app.route("/health-records", methods=["POST"])
def save_health_record():
    try:
        data = request.json
        record_id = str(uuid.uuid4())
        db = get_db()
        db.execute(
            "INSERT INTO health_records (id,patient_id,patient_name,type,doctor,hospital,details,date) VALUES (?,?,?,?,?,?,?,?)",
            (record_id, data["patientId"], data["patientName"], data["type"],
             data.get("doctor",""), data.get("hospital",""),
             data.get("details",""), datetime.now().isoformat())
        )
        db.commit()
        return jsonify({"success": True, "id": record_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health-records/<patient_id>", methods=["GET"])
def get_health_records(patient_id):
    try:
        db = get_db()
        rows = db.execute(
            "SELECT * FROM health_records WHERE patient_id = ? ORDER BY date DESC", (patient_id,)
        ).fetchall()
        return jsonify({"records": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════
#  PRESCRIPTIONS
# ══════════════════════════════════════════════════════════

@app.route("/prescriptions", methods=["POST"])
def save_prescription():
    try:
        data = request.json
        rx_id = str(uuid.uuid4())
        db = get_db()
        db.execute(
            "INSERT INTO prescriptions (id,patient_id,patient_name,doctor_name,hospital,medicines,advice,issued_at) VALUES (?,?,?,?,?,?,?,?)",
            (rx_id, data["patientId"], data["patientName"], data["doctorName"],
             data["hospital"], data["medicines"], data.get("advice",""),
             datetime.now().isoformat())
        )
        db.commit()
        return jsonify({"success": True, "id": rx_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/prescriptions/<patient_id>", methods=["GET"])
def get_prescriptions(patient_id):
    try:
        db = get_db()
        rows = db.execute(
            "SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY issued_at DESC", (patient_id,)
        ).fetchall()
        return jsonify({"prescriptions": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════
#  EXISTING AI ENDPOINTS (unchanged)
# ══════════════════════════════════════════════════════════

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        question = data.get("question", "")
        if not question:
            return jsonify({"error": "No question provided"}), 400

        output_language = detect(question)

        health_system_prompt = f"""You are AarogyaMitra AI, a compassionate multilingual health assistant for rural India (Nabha, Punjab).
Respond ONLY in the SAME language as the user's query (detected: {output_language}).
You MUST return a valid JSON object with these exact keys (no extra text, no markdown, just JSON):

{{
  "urgency": "low" | "medium" | "high" | "emergency",
  "urgency_message": "one line explanation of urgency in user language",
  "likely_condition": "Most probable condition name in user language",
  "symptom_analysis": "2-3 lines explaining what symptoms suggest in user language",
  "precautions": ["precaution 1", "precaution 2", "precaution 3", ...],
  "home_remedies": ["remedy 1", "remedy 2", "remedy 3", ...],
  "dos": ["do 1", "do 2", ...],
  "donts": ["don't 1", "don't 2", ...],
  "diet_advice": "brief diet recommendation",
  "when_to_see_doctor": "specific signs that need immediate professional care",
  "specialist": "General Medicine" | "Pediatrics" | "Orthopedics" | "Gynecology" | "Dermatology" | "ENT",
  "summary": "2-line plain language summary for rural patient"
}}

Rules:
- urgency=emergency if chest pain, difficulty breathing, stroke symptoms, or unconsciousness
- urgency=high if fever >103F, severe pain, blood in urine/stool, or child illness
- urgency=medium for common infections, moderate pain, persistent symptoms
- urgency=low for mild symptoms manageable at home
- Give at least 4 precautions and 3 home remedies
- All content must be in {output_language} language
- Return ONLY valid JSON, no other text"""

        raw = groq_chat(health_system_prompt, question)

        # Extract JSON from the response
        import json as json_lib
        try:
            # Strip any accidental markdown
            clean = re.sub(r'```json|```', '', raw).strip()
            structured = json_lib.loads(clean)
        except Exception:
            # Fallback: return as plain text
            structured = None

        if structured:
            return jsonify({"structured": structured, "response": structured.get("summary", raw), "summary": raw})
        else:
            # Legacy fallback
            agent_answer = format_text(remove_markdown(raw))
            return jsonify({"response": agent_answer, "summary": agent_answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/medicine", methods=["POST"])
def medicine_info():
    try:
        data = request.json
        medicine = data.get("medicine", "")
        if not medicine:
            return jsonify({"error": "Medicine name is required"}), 400

        medicine_system_prompt = """You are a medicine information assistant for rural India.
Given a medicine name, provide accurate information in this EXACT JSON format (respond with ONLY the JSON, no markdown):
{
  "name": "Medicine Name (Generic)",
  "usage": "What this medicine is used for, in simple terms",
  "dosage": "Standard dosage instructions",
  "sideEffects": "Common side effects to watch for",
  "alternatives": "2-3 alternative medicines or generic options",
  "price": "Approximate price range in INR (e.g. ₹20-50 per strip)",
  "availability": "Common/Widely Available/Prescription Required"
}

Keep language simple for rural users. Include generic alternatives that may be cheaper.
RESPOND WITH ONLY THE JSON OBJECT, NO OTHER TEXT."""

        medicine_query = f"Provide information about the medicine: {medicine}"
        response_text = groq_chat(medicine_system_prompt, medicine_query)

        response_text = response_text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        response_text = response_text.strip()

        info = json.loads(response_text)
        return jsonify({"info": info})
    except json.JSONDecodeError:
        return jsonify({"error": "Could not parse medicine information. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/news", methods=["POST"])
def get_news():
    try:
        data = request.json
        language = data.get("language", "")
        if not language:
            return jsonify({"error": "Language selection is required"}), 400

        news_system_prompt = f"""You are a health news assistant for rural India.
Provide 5 recent and relevant health news articles in {language} language.
Format EACH article EXACTLY like this:

Title: [Article Title in {language}]
Description: [Brief description in {language}]
Content: [Detailed content paragraph in {language}]
URL: https://example.com/article-link
Source: [News Source Name]
Date: [YYYY-MM-DD]

Separate each article with a blank line followed by \"Title: \" for the next article.
Make the news realistic, relevant to Indian rural healthcare, and in the requested language.
Do NOT use markdown formatting."""

        news_query = f"Provide 5 latest health news articles in {language} language relevant to rural India."
        news_response = groq_chat(news_system_prompt, news_query)

        return jsonify({"news": news_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Boot ───────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    seed_doctors()
    print("\n🩺 Doctor login credentials:")
    for doc in DOCTOR_SEED:
        print(f"   {doc['name']:30s}  phone: {doc['phone']}  password: doctor123")
    print()
    app.run(debug=True, port=5000)