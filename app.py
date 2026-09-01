"""Flask REST API for the Akshara AI literacy-assistance platform."""
import os
import re
import json
import random
import time
import secrets
import sqlite3
import smtplib
from email.mime.text import MIMEText
from functools import wraps

from flask import Flask, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from sarvamai import SarvamAI
except ImportError:
    SarvamAI = None
from services.adaptive_engine import adaptive_profile, generate_personalized_lesson, proficiency_prediction, record_skill_attempt, recommendations_for, save_baseline

app = Flask(__name__, static_folder=".", static_url_path="")
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "change-this-secret-before-production"),
    DATABASE=os.environ.get("AKSHARA_DATABASE", os.path.join(app.root_path, "akshara.db")),
)
LANGUAGES = {"English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi"}
LEVELS = {"Beginner", "Elementary", "Intermediate", "Advanced"}
GOALS = {"Reading", "Writing", "Speaking", "Everyday communication"}
LANGUAGE_CODES = {"English": "en", "Hindi": "hi", "Telugu": "te", "Tamil": "ta", "Kannada": "kn", "Malayalam": "ml", "Bengali": "bn", "Marathi": "mr"}
LANGUAGE_GREETINGS = {"English": "hello", "Hindi": "नमस्ते", "Telugu": "నమస్కారం", "Tamil": "வணக்கம்", "Kannada": "ನಮಸ್ಕಾರ", "Malayalam": "നമസ്കാരം", "Bengali": "নমস্কার", "Marathi": "नमस्कार"}
SARVAM_LANGUAGE_CODES = {"English": "en-IN", "Hindi": "hi-IN", "Telugu": "te-IN", "Tamil": "ta-IN", "Kannada": "kn-IN", "Malayalam": "ml-IN", "Bengali": "bn-IN", "Marathi": "mr-IN"}
PRACTICE_VOCABULARY = {
    "English": [("hello", "greeting"), ("water", "water"), ("home", "home"), ("book", "book"), ("school", "school"), ("friend", "friend"), ("food", "food"), ("pen", "pen"), ("tree", "tree"), ("road", "road"), ("mother", "mother"), ("sun", "sun")],
    "Hindi": [("नमस्ते", "greeting"), ("पानी", "water"), ("घर", "home"), ("किताब", "book"), ("स्कूल", "school"), ("दोस्त", "friend"), ("खाना", "food"), ("कलम", "pen"), ("पेड़", "tree"), ("रास्ता", "road"), ("माँ", "mother"), ("सूरज", "sun")],
    "Telugu": [("నమస్కారం", "greeting"), ("నీరు", "water"), ("ఇల్లు", "home"), ("పుస్తకం", "book"), ("పాఠశాల", "school"), ("స్నేహితుడు", "friend"), ("ఆహారం", "food"), ("కలం", "pen"), ("చెట్టు", "tree"), ("రహదారి", "road"), ("అమ్మ", "mother"), ("సూర్యుడు", "sun")],
    "Tamil": [("வணக்கம்", "greeting"), ("நீர்", "water"), ("வீடு", "home"), ("புத்தகம்", "book")],
    "Kannada": [("ನಮಸ್ಕಾರ", "greeting"), ("ನೀರು", "water"), ("ಮನೆ", "home"), ("ಪುಸ್ತಕ", "book")],
    "Malayalam": [("നമസ്കാരം", "greeting"), ("വെള്ളം", "water"), ("വീട്", "home"), ("പുസ്തകം", "book")],
    "Bengali": [("নমস্কার", "greeting"), ("জল", "water"), ("ঘর", "home"), ("বই", "book")],
    "Marathi": [("नमस्कार", "greeting"), ("पाणी", "water"), ("घर", "home"), ("पुस्तक", "book")],
}

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"]); g.db.row_factory = sqlite3.Row
        ensure_schema(g.db)
    return g.db

@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None: db.close()

def ensure_schema(db):
    """Create or update the local SQLite schema safely on application startup."""
    # Keep a checked-in schema for fresh deployments and database tooling. The
    # additive migrations below preserve compatibility with older Akshara files.
    schema_path = os.path.join(app.root_path, "database", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path, encoding="utf-8") as schema_file:
            db.executescript(schema_file.read())
    db.execute("PRAGMA foreign_keys = ON")
    # Older Akshara databases may already have the base tables.  The checked-in
    # schema above is the single source of truth for fresh tables; only additive
    # learner-column migrations are needed for those existing files.
    columns = {row[1] for row in db.execute("PRAGMA table_info(learners)")}
    if "assessment_completed" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN assessment_completed INTEGER NOT NULL DEFAULT 0")
    if "assessment_data" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN assessment_data TEXT")
    if "streak_days" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN streak_days INTEGER NOT NULL DEFAULT 1")
    if "last_login_date" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN last_login_date TEXT")
    if "total_xp" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0")
    if "login_count" not in columns:
        db.execute("ALTER TABLE learners ADD COLUMN login_count INTEGER NOT NULL DEFAULT 1")
    db.executemany("INSERT OR IGNORE INTO languages (name, code) VALUES (?, ?)", LANGUAGE_CODES.items())
    seed_learning_data(db)
    db.commit()

def seed_learning_data(db):
    """Provide a connected literacy curriculum across all regional languages."""
    curriculum = [
        ("English", "Everyday Literacy: First Steps", "Build confidence with practical reading and writing.", "Beginner", [
            ("Letters and everyday words", [("Meet the alphabet", "Recognise letters used in daily life.", 5), ("Words around you", "Read familiar signs, labels, and names.", 7)]),
            ("Sentence Essentials", [("Short Greetings", "Learn simple greetings and responses.", 6), ("Daily Questions", "Ask and answer simple questions.", 8)])
        ]),
        ("Hindi", "हिंदी साक्षरता: पहली सीढ़ी", "व्यावहारिक पठन और लेखन सीखें।", "Beginner", [
            ("वर्णमाला और शब्द", [("अक्षर ज्ञान", "दैनिक जीवन के बुनियादी अक्षरों को पहचानें।", 5), ("पहचान के शब्द", "घर, नाम और साधारण संकेत पढ़ें।", 7)]),
            ("वाक्य प्रयोग", [("शुभकामनाएं", "नमस्ते और स्वागत के शब्द सीखें।", 6), ("रोज़मर्रा की बातें", "छोटे संवाद पढ़ें और समझें।", 8)])
        ]),
        ("Telugu", "తెలుగు అక్షరదీపాలు: మొదటి అడుగులు", "రోజువారీ చదవడం మరియు రాయడం నేర్చుకోండి.", "Beginner", [
            ("అక్షరాలు మరియు పదాలు", [("అక్షర జ్ఞానం", "రోజువారీ జీవితంలో ఉపయోగించే అక్షరాలను గుర్తించండి.", 5), ("పరిచయ పదాలు", "పేర్లు, సైన్ బోర్డులు చదవండి.", 7)]),
            ("వాక్య నిర్మాణం", [("శుభాకాంక్షలు", "నమస్కారం మరియు ఇతర మర్యాద పదాలు.", 6), ("రోజువారీ మాటలు", "చిన్న వాక్యాలను అర్థం చేసుకోండి.", 8)])
        ]),
        ("Tamil", "தமிழ் கற்றல்: முதல் படிகள்", "அன்றாட வாசிப்பு மற்றும் எழுத்து திறன் வளர்த்தல்.", "Beginner", [
            ("எழுத்துக்களும் சொற்களும்", [("எழுத்து அறிமுகம்", "தினசரி பயன்பாட்டு எழுத்துக்களை அறிதல்.", 5), ("அடிப்படைச் சொற்கள்", "அடையாளப் பலகைகள் வாசித்தல்.", 7)])
        ]),
        ("Kannada", "కన్నడ అక్షర కలుకే: మొదటి హజ్జెగలు", "ದೈನಂದಿನ ಓದು ಮತ್ತು ಬರಹ ಕಲಿಯಿರಿ.", "Beginner", [
            ("అక్షరగళు మత్తు పదగళు", [("ಅಕ್ಷರ ಪರಿಚಯ", "ಸಾಮಾನ್ಯ ಅಕ್ಷರಗಳನ್ನು ಗುರುತಿಸಿ.", 5), ("ಪರಿಚಿತ ಪದಗಳು", "ಸಣ್ಣ ವಾಕ್ಯಗಳನ್ನು ಓದಿ.", 7)])
        ]),
        ("Malayalam", "മലയാളം അക്ഷരവെളിച്ചം: ആദ്യ ചുവടുകൾ", "ദൈനംദിന വായനയും എഴുത്തും പഠിക്കാം.", "Beginner", [
            ("അക്ഷരങ്ങളും വാക്കുകളും", [("അക്ഷര പരിചയം", "നിത്യജീവിതത്തിലെ അക്ഷരങ്ങൾ തിരിച്ചറിയുക.", 5), ("വാക്കുകൾ", "സൈൻ ബോർഡുകളും പേരുകളും വായിക്കുക.", 7)])
        ]),
        ("Bengali", "বাংলা প্রাথমিক শিক্ষা: প্রথম পদক্ষেপ", "দৈনন্দিন পড়া ও লেখার চর্চা করুন।", "Beginner", [
            ("বর্ণমালা ও শব্দ", [("বর্ণ চেনা", "দৈনন্দিন ব্যবহারের বর্ণ চিনতে শিখুন।", 5), ("সহজ শব্দ", "পরিচিত সাইনবোর্ড ও নাম পড়ুন।", 7)])
        ]),
        ("Marathi", "मराठी साक्षरता: पहिले पाऊल", "दैनिक वाचन आणि लेखन शिकूया.", "Beginner", [
            ("मुळाक्षरे व शब्द", [("अक्षर ओळख", "दैनिक जीवनातील अक्षरे ओळखा.", 5), ("ओळखीचे शब्द", "पाटी व नावे वाचन सराव.", 7)])
        ])
    ]
    for lang_name, c_title, c_desc, level, topics_data in curriculum:
        lang = db.execute("SELECT id FROM languages WHERE name=?", (lang_name,)).fetchone()
        if not lang: continue
        lang_id = lang["id"]
        course = db.execute("SELECT id FROM courses WHERE language_id=? AND title=?", (lang_id, c_title)).fetchone()
        if course is None:
            course_id = db.execute("INSERT INTO courses (language_id,title,description,proficiency_level) VALUES (?,?,?,?)", (lang_id, c_title, c_desc, level)).lastrowid
            for t_seq, (t_title, lessons) in enumerate(topics_data, start=1):
                topic_id = db.execute("INSERT INTO topics (course_id,title,sequence_no) VALUES (?,?,?)", (course_id, t_title, t_seq)).lastrowid
                for l_seq, (l_title, l_content, l_time) in enumerate(lessons, start=1):
                    db.execute("INSERT INTO lessons (topic_id,title,content,sequence_no,estimated_minutes) VALUES (?,?,?,?,?)", (topic_id, l_title, l_content, l_seq, l_time))
        else:
            course_id = course["id"]

        # Every regional course has a small, reusable assessment bank covering
        # reading, writing, and comprehension for API clients and facilitators.
        assessment = db.execute("SELECT id FROM assessments WHERE course_id=? AND assessment_type='diagnostic' ORDER BY id LIMIT 1", (course_id,)).fetchone()
        if assessment is None:
            assessment_id = db.execute("INSERT INTO assessments (course_id,title,assessment_type) VALUES (?,?,?)", (course_id, f"{lang_name} Literacy Check", "diagnostic")).lastrowid
        else:
            assessment_id = assessment["id"]
        existing_questions = db.execute("SELECT COUNT(*) AS count FROM questions WHERE assessment_id=?", (assessment_id,)).fetchone()["count"]
        assessment_bank = [
            (f"Reading: choose a greeting in {lang_name}.", "multiple_choice", [("Greeting Word", 1), ("Book", 0), ("Table", 0)]),
            (f"Writing: copy the greeting word in {lang_name}.", "short_text", [("Greeting Word", 1)]),
            (f"Comprehension: read a short sentence in {lang_name} and choose its meaning.", "multiple_choice", [("Understands the sentence", 1), ("A random answer", 0), ("No answer", 0)]),
        ]
        for sequence_no, (question_text, question_type, answer_rows) in enumerate(assessment_bank[existing_questions:], start=existing_questions + 1):
            q_id = db.execute("INSERT INTO questions (assessment_id,question_text,question_type,sequence_no) VALUES (?,?,?,?)", (assessment_id, question_text, question_type, sequence_no)).lastrowid
            db.executemany("INSERT INTO answers (question_id,answer_text,is_correct) VALUES (?,?,?)", [(q_id, answer, correct) for answer, correct in answer_rows])

def serialize_rows(rows):
    return [dict(row) for row in rows]

def generate_practice_question(language, skill):
    """Generate a new literacy question from a safe, curriculum-controlled bank.

    A fresh random token and order make the stream unbounded without storing an
    impractical 'infinite' number of static rows in SQLite.
    """
    vocabulary = PRACTICE_VOCABULARY.get(language, PRACTICE_VOCABULARY["English"])
    chooser = random.SystemRandom()
    word, meaning = chooser.choice(vocabulary)
    distractors = [candidate_word for candidate_word, candidate_meaning in vocabulary if candidate_meaning != meaning]
    choices = [word, *chooser.sample(distractors, k=min(2, len(distractors)))]
    chooser.shuffle(choices)
    prompts = [
        f"Which {language} word means “{meaning}”?",
        f"Choose the correct {language} word for “{meaning}”.",
        f"Read the options. Select “{meaning}” in {language}.",
    ]
    if skill == "comprehension":
        prompts.extend([f"You see the word “{meaning}” in a short sentence. Which {language} option matches it?", f"Read carefully: select the {language} word for “{meaning}”."])
    elif skill == "writing":
        prompts.extend([f"Before writing, identify the correct {language} word for “{meaning}”.", f"Choose the spelling you would write for “{meaning}” in {language}."])
    return {"skill": skill, "question_text": chooser.choice(prompts), "choices": choices, "correct_answer": word}

def init_db():
    ensure_schema(get_db())

def learner_dict(row):
    learner = {key: row[key] for key in ("id", "name", "age", "email", "language", "proficiency", "goal")}
    learner["assessmentCompleted"] = bool(row["assessment_completed"])
    learner["streakDays"] = row["streak_days"] if "streak_days" in row.keys() else 1
    learner["totalXp"] = row["total_xp"] if "total_xp" in row.keys() else 0
    learner["loginCount"] = row["login_count"] if "login_count" in row.keys() else 1
    learner["lastLoginDate"] = row["last_login_date"] if "last_login_date" in row.keys() else None
    return learner

def build_learning_path(db, learner):
    """Return the next useful lesson and a transparent rule-based recommendation.

    The recommendation combines the learner's chosen language, completed work,
    and recent pronunciation results.  Keeping this logic on the server makes
    the same adaptive path available to the dashboard and future mobile clients.
    """
    lessons = db.execute("""
        SELECT lessons.id, lessons.title, lessons.content, lessons.estimated_minutes,
               topics.title AS topic_title, COALESCE(learning_progress.completion_percent, 0) AS completion_percent
        FROM lessons
        JOIN topics ON topics.id = lessons.topic_id
        JOIN courses ON courses.id = topics.course_id
        JOIN languages ON languages.id = courses.language_id
        LEFT JOIN learning_progress ON learning_progress.lesson_id = lessons.id
            AND learning_progress.learner_id = ?
        WHERE languages.name = ?
        ORDER BY topics.sequence_no, lessons.sequence_no
    """, (learner["id"], learner["language"])).fetchall()
    completed = sum(lesson["completion_percent"] >= 100 for lesson in lessons)
    next_lesson = next((lesson for lesson in lessons if lesson["completion_percent"] < 100), None)
    voice_average = db.execute(
        "SELECT AVG(match_score) AS score FROM voice_assessments WHERE learner_id=?",
        (learner["id"],)
    ).fetchone()["score"]

    if not lessons:
        message = f"We are preparing {learner['language']} lessons for your learning path."
    elif next_lesson is None:
        message = "You completed this learning path. Retake the assessment to unlock your next level."
    elif voice_average is not None and voice_average < 70:
        message = f"Practice the voice coach, then continue with “{next_lesson['title']}” to strengthen pronunciation."
    elif completed == 0:
        message = f"Start with “{next_lesson['title']}”, a short {next_lesson['estimated_minutes']}-minute {learner['language']} lesson matched to your {learner['proficiency']} level."
    else:
        message = f"Your next step is “{next_lesson['title']}”. You have completed {completed} of {len(lessons)} lessons in your {learner['language']} path."

    return {
        "message": message,
        "completed_lessons": completed,
        "total_lessons": len(lessons),
        "progress_percent": round((completed / len(lessons) * 100) if lessons else 0, 1),
        "average_pronunciation_score": round(voice_average or 0, 1),
        "next_lesson": dict(next_lesson) if next_lesson else None,
    }

def current_learner(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        learner_id = session.get("learner_id")
        learner = get_db().execute("SELECT * FROM learners WHERE id = ?", (learner_id,)).fetchone() if learner_id else None
        if learner is None:
            session.clear(); return jsonify(error="Authentication required."), 401
        return view(learner, *args, **kwargs)
    return wrapped

def validate(data, include_password=False, require_learning_preferences=True):
    required = {"name", "age", "language"} | ({"proficiency", "goal"} if require_learning_preferences else set()) | ({"email", "password"} if include_password else set())
    if any(not str(data.get(key, "")).strip() for key in required): return "Please provide all required learner information."
    if not isinstance(data.get("age"), int) or not 5 <= data["age"] <= 120: return "Age must be between 5 and 120."
    if data["language"] not in LANGUAGES: return "The selected language is invalid."
    if require_learning_preferences and (data["proficiency"] not in LEVELS or data["goal"] not in GOALS): return "One or more profile selections are invalid."
    if include_password:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", data["email"].strip()): return "Please provide a valid email address."
        if len(data["password"]) < 6: return "Password must contain at least 6 characters."
    return None

@app.get("/")
def home(): return send_from_directory(app.root_path, "index.html")

@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}; error = validate(data, include_password=True, require_learning_preferences=False)
    if error: return jsonify(error=error), 400
    db = get_db()
    try:
        cursor = db.execute("INSERT INTO learners (name,age,email,password_hash,language,proficiency,goal) VALUES (?,?,?,?,?,?,?)", (data["name"].strip(), data["age"], data["email"].strip().lower(), generate_password_hash(data["password"], method="pbkdf2:sha256"), data["language"], "Beginner", "Everyday communication")); db.commit()
    except sqlite3.IntegrityError: return jsonify(error="An account already exists with this email."), 409
    language_id = db.execute("SELECT id FROM languages WHERE name=?", (data["language"],)).fetchone()["id"]
    db.execute("INSERT OR IGNORE INTO learner_languages (learner_id, language_id) VALUES (?, ?)", (cursor.lastrowid, language_id)); db.commit()
    session["learner_id"] = cursor.lastrowid
    return jsonify(learner=learner_dict(db.execute("SELECT * FROM learners WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}; email = str(data.get("email", "")).strip().lower(); password = str(data.get("password", ""))
    learner = get_db().execute("SELECT * FROM learners WHERE email=?", (email,)).fetchone()
    if learner is None or not check_password_hash(learner["password_hash"], password): return jsonify(error="Email or password does not match our records."), 401
    session["learner_id"] = learner["id"]; return jsonify(learner=learner_dict(learner))

@app.post("/api/auth/logout")
def logout(): session.clear(); return "", 204

def send_reset_email(to_email, reset_url):
    subject = "Reset your Akshara password"
    body = f"Hello,\n\nYou requested a password reset for your Akshara account.\nClick the link below to set a new password:\n\n{reset_url}\n\nThis link is valid for 1 hour.\nIf you did not request this, please ignore this email."
    
    smtp_server = os.environ.get("SMTP_SERVER")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    
    print(f"\n========================================\n[EMAIL DISPATCH] Password Reset Link for {to_email}:\n{reset_url}\n========================================\n")
    
    if smtp_server and smtp_user and smtp_password:
        try:
            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = to_email
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, [to_email], msg.as_string())
        except Exception as e:
            print(f"SMTP dispatch error: {e}")

@app.post("/api/auth/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify(error="Please provide a valid email address."), 400
    
    db = get_db()
    learner = db.execute("SELECT id FROM learners WHERE email=?", (email,)).fetchone()
    if learner is None:
        return jsonify(error="No account found with this email address."), 404
        
    token = secrets.token_urlsafe(32)
    expires_at = time.time() + 3600  # 1 hour
    db.execute("DELETE FROM password_resets WHERE email=?", (email,))
    db.execute("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)", (email, token, expires_at))
    db.commit()
    
    reset_url = f"{request.host_url.rstrip('/')}/?reset_token={token}&email={email}"
    send_reset_email(email, reset_url)
    
    return jsonify(message=f"Password reset link sent to {email}. Please check your inbox.", reset_url=reset_url)

@app.post("/api/auth/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    token = str(data.get("token", "")).strip()
    new_password = str(data.get("new_password", "")).strip()
    
    if not email or not token:
        return jsonify(error="Invalid or missing reset token."), 400
    if len(new_password) < 6:
        return jsonify(error="New password must contain at least 6 characters."), 400
        
    db = get_db()
    row = db.execute("SELECT * FROM password_resets WHERE email=? AND token=?", (email, token)).fetchone()
    if row is None or row["expires_at"] < time.time():
        return jsonify(error="The reset link is invalid or has expired. Please request a new one."), 400
        
    learner = db.execute("SELECT id FROM learners WHERE email=?", (email,)).fetchone()
    if learner is None:
        return jsonify(error="Account not found."), 404
        
    db.execute("UPDATE learners SET password_hash=? WHERE id=?", (generate_password_hash(new_password, method="pbkdf2:sha256"), learner["id"]))
    db.execute("DELETE FROM password_resets WHERE email=?", (email,))
    db.commit()
    
    return jsonify(message="Password reset successfully! You can now sign in with your new password.")

@app.route("/api/auth/social/<provider>", methods=["GET", "POST"])
def social_login(provider):
    prov = provider.title()
    if prov.lower() not in {"google", "facebook", "apple"}:
        return jsonify(error="Unsupported social sign-in provider."), 404
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or request.args.get("email") or f"learner.{prov.lower()}@akshara.ai").strip().lower()
    name = str(data.get("name") or request.args.get("name") or f"Learner ({prov} User)").strip()

    db = get_db()
    learner = db.execute("SELECT * FROM learners WHERE email=?", (email,)).fetchone()
    if learner is None:
        cursor = db.execute(
            "INSERT INTO learners (name, age, email, password_hash, language, proficiency, goal, assessment_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
            (name, 24, email, generate_password_hash("social-pass", method="pbkdf2:sha256"), "Hindi", "Beginner", "Everyday communication")
        )
        db.commit()
        learner_id = cursor.lastrowid
        db.execute("INSERT OR IGNORE INTO social_accounts (learner_id, provider, provider_user_id) VALUES (?, ?, ?)", (learner_id, prov, f"{prov.lower()}_{learner_id}"))
        db.commit()
        learner = db.execute("SELECT * FROM learners WHERE id=?", (learner_id,)).fetchone()
    
    session["learner_id"] = learner["id"]
    return jsonify(learner=learner_dict(learner), message=f"Successfully signed in with {prov}!")

@app.route("/api/learners/me", methods=["GET", "PUT"])
@current_learner
def profile(learner):
    if request.method == "GET": return jsonify(learner=learner_dict(learner))
    data = request.get_json(silent=True) or {}; error = validate(data)
    if error: return jsonify(error=error), 400
    db = get_db(); db.execute("UPDATE learners SET name=?,age=?,language=?,proficiency=?,goal=? WHERE id=?", (data["name"].strip(), data["age"], data["language"], data["proficiency"], data["goal"], learner["id"])); db.commit()
    return jsonify(learner=learner_dict(db.execute("SELECT * FROM learners WHERE id=?", (learner["id"],)).fetchone()))

@app.post("/api/learners/me/assessment")
@current_learner
def submit_assessment(learner):
    data = request.get_json(silent=True) or {}
    required = {"focus", "reading", "writing", "confidence", "daily_time", "reading_check", "writing_check", "comprehension_check"}
    if not required.issubset(data) or any(not str(data[key]).strip() for key in required):
        return jsonify(error="Please answer every assessment question."), 400
    expected_greeting = LANGUAGE_GREETINGS.get(learner["language"], LANGUAGE_GREETINGS["English"])
    writing_answer = " ".join(str(data["writing_check"]).casefold().split())
    writing_correct = writing_answer == expected_greeting.casefold()
    reading_correct = data["reading_check"] == "correct"
    comprehension_correct = data["comprehension_check"] == "correct"
    knowledge_correct = sum((reading_correct, writing_correct, comprehension_correct))
    confidence_score = {"Not yet": 0, "A little": 1, "Comfortable": 2}.get(data["reading"], 0) + {"Not yet": 0, "A little": 1, "Comfortable": 2}.get(data["writing"], 0)
    score = round((confidence_score / 4 * 30) + (knowledge_correct / 3 * 70), 1)
    recommended_level = "Beginner" if score <= 35 else "Elementary" if score <= 65 else "Intermediate" if score <= 85 else "Advanced"
    db = get_db()
    db.execute("UPDATE learners SET assessment_completed=1, assessment_data=?, proficiency=? WHERE id=?", (json.dumps(data), recommended_level, learner["id"])); db.commit()
    save_baseline(db, learner["id"], data, {
        "reading": 100 if reading_correct else 20,
        "writing": 100 if writing_correct else 20,
        "comprehension": 100 if comprehension_correct else 20,
    })
    assessment_row = db.execute("SELECT id FROM assessments WHERE assessment_type='diagnostic' ORDER BY id LIMIT 1").fetchone()
    if assessment_row:
        db.execute("INSERT INTO assessment_results (learner_id,assessment_id,score,recommended_level) VALUES (?,?,?,?)", (learner["id"], assessment_row["id"], score, recommended_level))
    db.execute("INSERT INTO recommendations (learner_id,recommendation_type,content) VALUES (?,?,?)", (learner["id"], "starting_path", f"Start with {data['focus'].lower()} activities at the {recommended_level} level.")); db.commit()
    updated = db.execute("SELECT * FROM learners WHERE id=?", (learner["id"],)).fetchone()
    return jsonify(learner=learner_dict(updated), recommendation={"level": recommended_level, "focus": data["focus"], "score": score, "checks_correct": knowledge_correct})

@app.get("/api/languages")
def list_languages():
    return jsonify(languages=serialize_rows(get_db().execute("SELECT id,name,code FROM languages ORDER BY name").fetchall()))

@app.get("/api/courses")
def list_courses():
    rows = get_db().execute("SELECT courses.id,courses.title,courses.description,courses.proficiency_level,languages.name AS language FROM courses JOIN languages ON languages.id=courses.language_id ORDER BY courses.id").fetchall()
    return jsonify(courses=serialize_rows(rows))

@app.get("/api/courses/<int:course_id>/topics")
def course_topics(course_id):
    db = get_db()
    if db.execute("SELECT id FROM courses WHERE id=?", (course_id,)).fetchone() is None: return jsonify(error="Course not found."), 404
    rows = db.execute("SELECT id,title,sequence_no FROM topics WHERE course_id=? ORDER BY sequence_no", (course_id,)).fetchall()
    return jsonify(topics=serialize_rows(rows))

@app.get("/api/topics/<int:topic_id>/lessons")
def topic_lessons(topic_id):
    rows = get_db().execute("SELECT id,title,content,sequence_no,estimated_minutes FROM lessons WHERE topic_id=? ORDER BY sequence_no", (topic_id,)).fetchall()
    return jsonify(lessons=serialize_rows(rows))

@app.get("/api/assessments/<int:assessment_id>")
@current_learner
def assessment_detail(_learner, assessment_id):
    db = get_db(); assessment = db.execute("SELECT id,title,assessment_type FROM assessments WHERE id=?", (assessment_id,)).fetchone()
    if assessment is None: return jsonify(error="Assessment not found."), 404
    questions = []
    for question in db.execute("SELECT id,question_text,question_type,sequence_no FROM questions WHERE assessment_id=? ORDER BY sequence_no", (assessment_id,)):
        item = dict(question); item["answers"] = serialize_rows(db.execute("SELECT id,answer_text FROM answers WHERE question_id=?", (question["id"],)).fetchall()); questions.append(item)
    return jsonify(assessment=dict(assessment), questions=questions)

@app.get("/api/v1/practice/questions")
@current_learner
def generate_practice_questions(learner):
    skill = str(request.args.get("skill", "reading")).strip().lower()
    if skill not in {"reading", "writing", "vocab", "comprehension"}:
        return jsonify(error="Choose reading, writing, vocab, or comprehension."), 400
    try:
        count = int(request.args.get("count", 1))
    except ValueError:
        return jsonify(error="Count must be a whole number."), 400
    if not 1 <= count <= 10:
        return jsonify(error="Request between 1 and 10 questions at a time."), 400
    db = get_db(); generated = []
    for _ in range(count):
        question = generate_practice_question(learner["language"], skill)
        token = secrets.token_urlsafe(18)
        db.execute("INSERT INTO generated_practice_questions (token,learner_id,skill,question_text,choices_json,correct_answer) VALUES (?,?,?,?,?,?)", (token, learner["id"], skill, question["question_text"], json.dumps(question["choices"], ensure_ascii=False), question["correct_answer"]))
        generated.append({"token": token, "skill": skill, "question_text": question["question_text"], "choices": question["choices"]})
    db.commit()
    return jsonify(language=learner["language"], questions=generated)

@app.post("/api/v1/practice/questions/<token>/answer")
@current_learner
def answer_practice_question(learner, token):
    answer = str((request.get_json(silent=True) or {}).get("answer", "")).strip()
    db = get_db()
    question = db.execute("SELECT * FROM generated_practice_questions WHERE token=? AND learner_id=?", (token, learner["id"])).fetchone()
    if question is None:
        return jsonify(error="Question not found or belongs to a different learner."), 404
    if question["answered_at"] is not None:
        return jsonify(error="This question has already been answered."), 409
    correct = answer.casefold() == question["correct_answer"].casefold()
    db.execute("UPDATE generated_practice_questions SET answered_at=CURRENT_TIMESTAMP WHERE token=?", (token,))
    adaptive_skill = "reading" if question["skill"] == "vocab" else question["skill"]
    record_skill_attempt(db, learner["id"], adaptive_skill, 100 if correct else 0, 30)
    db.commit()
    return jsonify(correct=correct, message="Wonderful work!" if correct else "Nice try — review the words and try another question.")

@app.post("/api/assessments/<int:assessment_id>/results")
@current_learner
def save_assessment_result(learner, assessment_id):
    data = request.get_json(silent=True) or {}; score = data.get("score")
    if not isinstance(score, (int, float)): return jsonify(error="A numeric score is required."), 400
    if get_db().execute("SELECT id FROM assessments WHERE id=?", (assessment_id,)).fetchone() is None: return jsonify(error="Assessment not found."), 404
    level = "Beginner" if score < 50 else "Elementary" if score < 80 else "Intermediate"
    get_db().execute("INSERT INTO assessment_results (learner_id,assessment_id,score,recommended_level) VALUES (?,?,?,?)", (learner["id"], assessment_id, score, level)); get_db().commit()
    return jsonify(message="Assessment result saved.", recommended_level=level), 201

@app.put("/api/lessons/<int:lesson_id>/progress")
@current_learner
def update_progress(learner, lesson_id):
    data = request.get_json(silent=True) or {}; completion = data.get("completion_percent")
    if not isinstance(completion, (int, float)) or not 0 <= completion <= 100: return jsonify(error="Completion percentage must be from 0 to 100."), 400
    db = get_db()
    if db.execute("SELECT id FROM lessons WHERE id=?", (lesson_id,)).fetchone() is None: return jsonify(error="Lesson not found."), 404
    db.execute("""INSERT INTO learning_progress (learner_id,lesson_id,completion_percent,last_accessed_at,completed_at) VALUES (?,?,?,CURRENT_TIMESTAMP,CASE WHEN ?=100 THEN CURRENT_TIMESTAMP ELSE NULL END)
        ON CONFLICT(learner_id,lesson_id) DO UPDATE SET completion_percent=excluded.completion_percent,last_accessed_at=CURRENT_TIMESTAMP,completed_at=CASE WHEN excluded.completion_percent=100 THEN CURRENT_TIMESTAMP ELSE learning_progress.completed_at END""", (learner["id"], lesson_id, completion, completion)); db.commit()
    if completion == 100:
        record_skill_attempt(db, learner["id"], "reading", 100, 300)
        db.commit()
    return jsonify(message="Learning progress updated.")

@app.get("/api/learners/me/recommendations")
@current_learner
def learner_recommendations(learner):
    rows = get_db().execute("SELECT id,recommendation_type,content,is_seen,created_at FROM recommendations WHERE learner_id=? ORDER BY created_at DESC", (learner["id"],)).fetchall()
    return jsonify(recommendations=serialize_rows(rows))

@app.get("/api/learners/me/learning-path")
@current_learner
def learning_path(learner):
    return jsonify(path=build_learning_path(get_db(), learner))

# Versioned API surface for a mobile client or a future React/Next.js frontend.
@app.get("/api/v1/learning-path")
@current_learner
def v1_learning_path(learner):
    db = get_db()
    generated = serialize_rows(db.execute("SELECT id, skill, title, payload, status, created_at, completed_at FROM personalized_lessons WHERE learner_id=? ORDER BY created_at DESC LIMIT 5", (learner["id"],)).fetchall())
    for lesson in generated:
        lesson["payload"] = json.loads(lesson["payload"])
    return jsonify(path=build_learning_path(db, learner), adaptive=recommendations_for(db, learner), personalized_lessons=generated)

@app.get("/api/v1/recommendations")
@current_learner
def v1_recommendations(learner):
    return jsonify(recommendation=recommendations_for(get_db(), learner))

@app.get("/api/v1/proficiency")
@current_learner
def v1_proficiency(learner):
    db = get_db()
    return jsonify(profile=adaptive_profile(db, learner["id"]), prediction=proficiency_prediction(db, learner["id"]))

@app.post("/api/v1/learning-path/lessons")
@current_learner
def generate_learning_lesson(learner):
    data = request.get_json(silent=True) or {}
    skill = str(data.get("skill", "")).strip().lower() or None
    try:
        lesson = generate_personalized_lesson(get_db(), learner, skill)
    except ValueError as error:
        return jsonify(error=str(error)), 400
    db = get_db()
    db.execute("INSERT INTO personalized_lessons (id, learner_id, skill, title, payload) VALUES (?, ?, ?, ?, ?)", (lesson["id"], learner["id"], lesson["skill"], lesson["title"], json.dumps(lesson, ensure_ascii=False)))
    db.commit()
    return jsonify(lesson=lesson), 201

@app.put("/api/v1/learning-path/lessons/<lesson_id>")
@current_learner
def update_generated_lesson(learner, lesson_id):
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()
    if status not in {"assigned", "completed"}:
        return jsonify(error="Status must be assigned or completed."), 400
    score = data.get("score", 80)
    duration = data.get("duration_seconds", 0)
    if status == "completed" and (not isinstance(score, (int, float)) or isinstance(score, bool) or not 0 <= score <= 100):
        return jsonify(error="Completion score must be a number from 0 to 100."), 400
    if not isinstance(duration, int) or duration < 0:
        return jsonify(error="Duration must be a non-negative whole number."), 400
    db = get_db()
    row = db.execute("SELECT * FROM personalized_lessons WHERE id=? AND learner_id=?", (lesson_id, learner["id"])).fetchone()
    if row is None:
        return jsonify(error="Personalized lesson not found."), 404
    db.execute("UPDATE personalized_lessons SET status=?, completed_at=CASE WHEN ?='completed' THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id=?", (status, status, lesson_id))
    if status == "completed":
        record_skill_attempt(db, learner["id"], row["skill"], float(score), duration)
    db.commit()
    return jsonify(message="Personalized lesson updated.", status=status, adaptive=recommendations_for(db, learner))

@app.post("/api/v1/recommendations/feedback")
@current_learner
def recommendation_feedback(learner):
    data = request.get_json(silent=True) or {}
    helpful = data.get("helpful")
    if not isinstance(helpful, bool):
        return jsonify(error="Helpful must be true or false."), 400
    db = get_db()
    db.execute("INSERT INTO learning_events (learner_id, event_type, score) VALUES (?, 'recommendation_feedback', ?)", (learner["id"], 100 if helpful else 0))
    db.commit()
    return jsonify(message="Recommendation feedback saved.")

@app.post("/api/v1/skill-attempts")
@current_learner
def v1_skill_attempt(learner):
    data = request.get_json(silent=True) or {}
    skill = str(data.get("skill", "")).strip().lower()
    score = data.get("score")
    duration = data.get("duration_seconds", 0)
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        return jsonify(error="Score must be a number from 0 to 100."), 400
    if not isinstance(duration, int) or duration < 0:
        return jsonify(error="Duration must be a non-negative whole number."), 400
    try:
        record_skill_attempt(get_db(), learner["id"], skill, float(score), duration)
        get_db().commit()
    except ValueError as error:
        return jsonify(error=str(error)), 400
    return jsonify(message="Practice result saved.", adaptive=recommendations_for(get_db(), learner)), 201

@app.get("/api/v1/analytics")
@current_learner
def v1_analytics(learner):
    db = get_db()
    profile = adaptive_profile(db, learner["id"])
    totals = db.execute("""
        SELECT COUNT(*) AS total_events, COALESCE(SUM(duration_seconds), 0) AS total_seconds,
               ROUND(AVG(CASE WHEN skill='pronunciation' THEN score END), 1) AS pronunciation_accuracy
        FROM learning_events WHERE learner_id=?
    """, (learner["id"],)).fetchone()
    trend = serialize_rows(db.execute("""
        SELECT DATE(created_at) AS date, COUNT(*) AS activities,
               ROUND(AVG(score), 1) AS average_score, COALESCE(SUM(duration_seconds), 0) AS seconds_spent
        FROM learning_events
        WHERE learner_id=? AND DATE(created_at) >= DATE('now', '-6 days')
        GROUP BY DATE(created_at) ORDER BY date
    """, (learner["id"],)).fetchall())
    return jsonify(analytics={
        "profile": profile,
        "total_activities": totals["total_events"],
        "time_spent_seconds": totals["total_seconds"],
        "pronunciation_accuracy": totals["pronunciation_accuracy"] or 0,
        "seven_day_trend": trend,
    })

@app.post("/api/voice/synthesize")
@current_learner
def synthesize_voice(learner):
    """Create Indic-language audio with Sarvam Bulbul TTS; never expose the API key."""
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    language = str(data.get("language", learner["language"])).strip()
    if not text or len(text) > 2500:
        return jsonify(error="Text must contain between 1 and 2500 characters."), 400
    if language not in SARVAM_LANGUAGE_CODES:
        return jsonify(error="Unsupported speech language."), 400
    if SarvamAI is None:
        return jsonify(error="Sarvam SDK is not installed. Run pip install -r requirements.txt."), 503
    api_key = os.environ.get("SARVAM_API_KEY")
    if not api_key:
        return jsonify(error="Sarvam TTS is not configured. Set SARVAM_API_KEY and restart Flask."), 503
    try:
        client = SarvamAI(api_subscription_key=api_key)
        response = client.text_to_speech.convert(
            text=text,
            language_code=SARVAM_LANGUAGE_CODES[language],
            model="bulbul:v3",
            speaker=os.environ.get("SARVAM_TTS_SPEAKER", "shubh"),
        )
        audios = getattr(response, "audios", None)
        if audios is None and isinstance(response, dict):
            audios = response.get("audios")
        if not audios:
            return jsonify(error="Sarvam did not return audio."), 502
        return jsonify(audio_base64="".join(audios), mime_type="audio/wav", provider="sarvam")
    except Exception as error:
        app.logger.warning("Sarvam TTS request failed: %s", error)
        return jsonify(error="Sarvam could not generate speech right now."), 502

@app.post("/api/voice/assess")
@current_learner
def record_voice_assessment(learner):
    data = request.get_json(silent=True) or {}
    target_text = str(data.get("target_text", "")).strip()
    spoken_text = str(data.get("spoken_text", "")).strip()
    score = data.get("match_score")
    if not target_text:
        return jsonify(error="Target text is required."), 400
    if not isinstance(score, (int, float)) or isinstance(score, bool) or not 0 <= score <= 100:
        return jsonify(error="Match score must be a number from 0 to 100."), 400
    db = get_db()
    db.execute("INSERT INTO voice_assessments (learner_id, target_text, spoken_text, match_score) VALUES (?, ?, ?, ?)", (learner["id"], target_text, spoken_text, score))
    record_skill_attempt(db, learner["id"], "pronunciation", score, 60)
    db.commit()
    return jsonify(message="Voice pronunciation assessment saved.", match_score=score)

@app.get("/api/learners/me/report")
@current_learner
def learner_report(learner):
    db = get_db()
    path = build_learning_path(db, learner)
    total_lessons = path["total_lessons"]
    completed_lessons = path["completed_lessons"]
    voice_stats = db.execute("SELECT COUNT(*) as total_attempts, AVG(match_score) as avg_score FROM voice_assessments WHERE learner_id=?", (learner["id"],)).fetchone()
    diagnostic = db.execute("SELECT score, recommended_level, completed_at FROM assessment_results WHERE learner_id=? ORDER BY completed_at DESC LIMIT 1", (learner["id"],)).fetchone()
    recent_recs = serialize_rows(db.execute("SELECT content FROM recommendations WHERE learner_id=? ORDER BY created_at DESC LIMIT 3", (learner["id"],)).fetchall())
    
    return jsonify(report={
        "learner": learner_dict(learner),
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "progress_percent": path["progress_percent"],
        "voice_attempts": voice_stats["total_attempts"] or 0,
        "avg_pronunciation_score": round(voice_stats["avg_score"] or 0.0, 1),
        "diagnostic_assessment": dict(diagnostic) if diagnostic else None,
        "recommendations": recent_recs
    })

@app.get("/api/learners/me/achievements")
@current_learner
def learner_achievements(learner):
    db = get_db()
    rows = db.execute("SELECT badge_key, badge_name, unlocked_at FROM learner_achievements WHERE learner_id=? ORDER BY unlocked_at DESC", (learner["id"],)).fetchall()
    return jsonify(achievements=serialize_rows(rows))

@app.post("/api/learners/me/streak")
@current_learner
def update_streak(learner):
    import datetime
    db = get_db()
    today_str = datetime.date.today().isoformat()
    last_date = learner["last_login_date"]
    current_streak = learner["streak_days"] or 1
    new_login_count = (learner["login_count"] or 0) + 1
    
    if last_date != today_str:
        if last_date:
            try:
                last_dt = datetime.date.fromisoformat(last_date)
                delta = (datetime.date.today() - last_dt).days
                if delta == 1:
                    current_streak += 1
                elif delta > 1:
                    current_streak = 1
            except Exception:
                current_streak = 1
        else:
            current_streak = 1

        db.execute("UPDATE learners SET streak_days=?, last_login_date=?, login_count=? WHERE id=?", (current_streak, today_str, new_login_count, learner["id"]))
        
        # Check streak badge
        if current_streak >= 3:
            db.execute("INSERT OR IGNORE INTO learner_achievements (learner_id, badge_key, badge_name) VALUES (?, ?, ?)", (learner["id"], "streak_3", "🔥 3-Day Streak Master"))
        if current_streak >= 7:
            db.execute("INSERT OR IGNORE INTO learner_achievements (learner_id, badge_key, badge_name) VALUES (?, ?, ?)", (learner["id"], "streak_7", "🏆 7-Day Champion"))
        db.commit()

    # Award welcome badge if missing
    db.execute("INSERT OR IGNORE INTO learner_achievements (learner_id, badge_key, badge_name) VALUES (?, ?, ?)", (learner["id"], "first_step", "🌟 Neo-Learner Pioneer"))
    db.commit()
    
    achievements = serialize_rows(db.execute("SELECT badge_key, badge_name, unlocked_at FROM learner_achievements WHERE learner_id=?", (learner["id"],)).fetchall())
    updated_learner = db.execute("SELECT * FROM learners WHERE id=?", (learner["id"],)).fetchone()
    return jsonify(learner=learner_dict(updated_learner), achievements=achievements)

@app.post("/api/practice/submit")
@current_learner
def practice_submit(learner):
    data = request.get_json(silent=True) or {}
    try:
        points = int(data.get("points", 10))
    except (TypeError, ValueError):
        return jsonify(error="Points must be a whole number."), 400
    if not 0 <= points <= 250:
        return jsonify(error="Points must be between 0 and 250."), 400
    badge = data.get("badge")
    if badge is not None and (not isinstance(badge, dict) or not isinstance(badge.get("key"), str) or not isinstance(badge.get("name"), str)):
        return jsonify(error="Badge details are invalid."), 400
    db = get_db()
    db.execute("UPDATE learners SET total_xp = total_xp + ? WHERE id=?", (points, learner["id"]))
    if badge:
        db.execute("INSERT OR IGNORE INTO learner_achievements (learner_id, badge_key, badge_name) VALUES (?, ?, ?)", (learner["id"], badge["key"], badge["name"]))
    db.commit()
    updated = db.execute("SELECT * FROM learners WHERE id=?", (learner["id"],)).fetchone()
    achievements = serialize_rows(db.execute("SELECT badge_key, badge_name, unlocked_at FROM learner_achievements WHERE learner_id=?", (learner["id"],)).fetchall())
    return jsonify(learner=learner_dict(updated), achievements=achievements)

@app.get("/api/health")
def health():
    """Expose API and SQLite readiness for local deployment checks."""
    try:
        db = get_db()
        learners = db.execute("SELECT COUNT(*) AS count FROM learners").fetchone()["count"]
        lessons = db.execute("SELECT COUNT(*) AS count FROM lessons").fetchone()["count"]
        return jsonify(
            status="ok",
            service="Akshara AI literacy API",
            database={"status": "ok", "learners": learners, "lessons": lessons},
        )
    except sqlite3.Error as error:
        return jsonify(status="degraded", service="Akshara AI literacy API", database={"status": "error", "message": str(error)}), 503

with app.app_context(): init_db()
if __name__ == "__main__":
    # Flask's macOS debug file watcher can be blocked by local privacy rules.
    # Run reliably by default; set FLASK_DEBUG=1 only when debugging is needed.
    app.run(host="127.0.0.1", port=int(os.environ.get("AKSHARA_PORT", "5050")), debug=os.environ.get("FLASK_DEBUG") == "1", use_reloader=False)
