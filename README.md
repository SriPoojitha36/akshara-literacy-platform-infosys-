# Akshara — AI-Based Intelligent Literacy Assistance Platform

**Project Title:** AI-Based Development of an Intelligent Literacy Assistance Platform for Neo-Learners  
**Implementation status:** Complete demonstrable web platform (Modules 1–4)  

---

## Implemented capabilities

The Week 1–2 foundation is implemented end-to-end for learning content management and diagnostic literacy assessment:

1. **Learner onboarding and assessment:** Registration, secure sign-in, profile management, and an onboarding diagnostic combining self-assessment with scored reading, writing, and comprehension checks.
2. **Multilingual literacy content:** Course → topic → micro-lesson repository for English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, and Marathi, with regional-language titles and examples.
3. **Proficiency benchmark:** Diagnostic results map to Beginner (0–35%), Elementary (36–65%), Intermediate (66–85%), and Advanced (86–100%) tiers and are stored as assessment results.
4. **Adaptive learning path:** Server-side recommendations select the next incomplete lesson using the learner’s language, progress, proficiency, and recent pronunciation performance.
5. **Learning activities:** Reading, writing, vocabulary flashcards, comprehension, and practice puzzles with text-to-speech support.
6. **Voice coaching:** Browser Web Speech recognition records real learner speech and returns a transparent text-similarity pronunciation score. Browsers without the feature show a clear practice-only fallback rather than a fabricated result.
7. **Progress and engagement:** Lesson progress, XP, streaks, achievement badges, performance reports, printable certificates, and theme controls.

---

## Technology Stack

- **Backend:** Python 3, Flask REST API, SQLite3
- **Security:** Werkzeug password hashing, signed Flask session cookie
- **Frontend:** HTML5, Vanilla CSS3 (Executive Design System), Vanilla JS (`fetch` API)
- **Database ER Design:** Interactive HTML design view (`/database_design.html`)

---

## How to Run Locally

```bash
cd ~/Documents/infosys
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then visit **`http://127.0.0.1:5050`** in your browser.

### Sarvam AI voice setup

Akshara uses Sarvam Bulbul TTS for Indian-language pronunciation when a Sarvam key is configured. The key stays on the Flask server and is never sent to the browser.

```bash
export SARVAM_API_KEY="your_sarvam_api_key"
python app.py
```

Optionally set `SARVAM_TTS_SPEAKER` to an approved Sarvam speaker. Without a key, the Voice Coach falls back to browser text-to-speech.

### Database setup and verification

The database is a local SQLite file. The application automatically applies
`database/schema.sql`, runs compatibility migrations for older Akshara files,
and seeds the multilingual curriculum on startup. To initialize or verify the
database manually:

```bash
python3 database/check.py
```

Use a separate database without changing application code by setting
`AKSHARA_DATABASE`:

```bash
AKSHARA_DATABASE=/tmp/akshara-dev.db python3 database/check.py
```

The schema is repeatable and preserves existing learner data. See
`database_design.html` for the visual entity-relationship view.

---

## REST API Documentation

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a learner account |
| POST | `/api/auth/login` | Authenticate a learner |
| POST | `/api/auth/logout` | End current session |
| GET/POST | `/api/auth/social/:provider` | Social sign-in (Google, Facebook, Apple) |
| GET | `/api/learners/me` | Get logged-in learner profile |
| PUT | `/api/learners/me` | Update logged-in learner profile |
| POST | `/api/learners/me/assessment` | Save initial diagnostic assessment & return level recommendation |
| GET | `/api/assessments/:id` | Retrieve assessment questions and answer choices |
| POST | `/api/assessments/:id/results` | Store a scored assessment result |
| GET | `/api/languages` | List supported regional languages |
| GET | `/api/courses` | List literacy courses |
| GET | `/api/courses/:id/topics` | List course topics |
| GET | `/api/topics/:id/lessons` | List topic micro-lessons |
| PUT | `/api/lessons/:id/progress` | Update lesson completion progress |
| GET | `/api/learners/me/recommendations` | Retrieve AI level recommendations |
| GET | `/api/learners/me/learning-path` | Retrieve the next adaptive lesson and learner-specific path progress |
| POST | `/api/voice/assess` | Store a validated pronunciation attempt |
| POST | `/api/voice/synthesize` | Generate regional-language audio using Sarvam Bulbul TTS |
| GET | `/api/learners/me/report` | Retrieve language-specific progress and voice metrics |
| GET | `/api/learners/me/achievements` | Retrieve unlocked badges |
| GET | `/api/v1/learning-path` | Retrieve adaptive path and generated assignments |
| GET | `/api/v1/recommendations` | Retrieve weak-skill recommendation and prediction |
| GET | `/api/v1/proficiency` | Retrieve current level, predicted level, and momentum |
| POST | `/api/v1/learning-path/lessons` | Generate a personalized micro-lesson |
| PUT | `/api/v1/learning-path/lessons/:id` | Update generated lesson status and skill score |
| POST | `/api/v1/skill-attempts` | Record reading, writing, comprehension, or pronunciation evidence |
| GET | `/api/v1/analytics` | Retrieve activity time, accuracy, and seven-day trends |
| POST | `/api/v1/recommendations/feedback` | Record whether a recommendation was helpful |
| GET | `/api/health` | Check API and SQLite readiness, including seeded record counts |

---

## Module 1 Database Design (Task 2)

SQLite automatically initializes normalized tables for learners, languages, courses, topics, lessons, assessments, questions, answers, results, progress, recommendations, voice attempts, skill mastery, and learning events.

Open **`http://127.0.0.1:5000/database_design.html`** to view Task 2 as an interactive visual entity-relationship diagram.
