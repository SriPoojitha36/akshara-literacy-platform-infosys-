# Intelligent Literacy Assistance Platform

## Project structure

```text
infosys/
├── app.py                     # Flask application, routes, startup migrations
├── services/
│   └── adaptive_engine.py     # Explainable proficiency and recommendation service
├── database/
│   ├── schema.sql             # Repeatable, versioned SQLite schema
│   └── check.py               # Database initialization and verification command
├── index.html                 # Mobile-responsive learner application
├── app.js                     # Voice interaction, lesson UI, API client
├── styles.css                 # Accessible high-contrast visual system
├── database_design.html       # Interactive ER diagram
├── docs/ARCHITECTURE.md       # This architecture and schema guide
└── requirements.txt
```

## Data model

The application uses SQLite for the local demonstrator. `database/schema.sql`
is the repeatable source of truth for fresh databases; `app.py` applies it on
startup and adds non-destructive learner-column migrations for older files.
Run `python3 database/check.py` to initialize or verify a database. Its
normalized model is directly portable to PostgreSQL: use `SERIAL`/`BIGSERIAL`
for keys and replace SQLite `ON CONFLICT` clauses with PostgreSQL equivalents.

| Table | Purpose | Key fields |
| --- | --- | --- |
| `learners` | Identity, onboarding state, level, learning preferences | `id`, `email`, `language`, `proficiency` |
| `languages` / `learner_languages` | Regional-language catalog and learner selection | `name`, `code`, `learner_id` |
| `courses` → `topics` → `lessons` | Multilingual content hierarchy | `language_id`, `course_id`, `topic_id` |
| `assessments` → `questions` → `answers` | Baseline and module assessment content | `assessment_type`, `question_type` |
| `assessment_results` | Historical assessment outcomes | `score`, `recommended_level` |
| `learning_progress` | Per-lesson completion state | `learner_id`, `lesson_id`, `completion_percent` |
| `voice_assessments` | Speech-to-text and pronunciation results | `target_text`, `spoken_text`, `match_score` |
| `learner_skill_scores` | Explainable skill mastery for the adaptive engine | `skill`, `mastery_score`, `attempts` |
| `learning_events` | Analytics audit log | `event_type`, `skill`, `score`, `duration_seconds` |
| `learner_achievements` | Streaks, XP badges, milestones | `badge_key`, `unlocked_at` |
| `personalized_lessons` | Generated lesson assignments and completion state | `skill`, `payload`, `status` |

## API boundaries

Existing endpoints remain available for the learner UI. Versioned endpoints
support external/mobile clients:

```text
GET  /api/v1/learning-path       # next lesson, progress, adaptive profile
GET  /api/v1/recommendations    # weak skill and learner-facing action
GET  /api/v1/analytics          # time, accuracy, trends, and skill scores
POST /api/v1/skill-attempts     # record reading/writing/comprehension practice
GET  /api/v1/proficiency        # current and predicted proficiency with momentum
POST /api/v1/learning-path/lessons # generate and persist a personalized micro-lesson
PUT  /api/v1/learning-path/lessons/:id # mark a generated lesson complete
POST /api/v1/recommendations/feedback # capture recommendation usefulness
```

## Adaptive-learning policy

Onboarding seeds reading, writing, comprehension, and pronunciation scores.
Each practice result updates mastery using 70% prior mastery and 30% recent
performance. Scores map to Beginner (0–35), Elementary (36–65), Intermediate
(66–85), and Advanced (86–100). The weakest skill determines the next
recommended activity. This transparent policy is a safe first release and can
be replaced by Bayesian Knowledge Tracing or a trained model later.

Week 3–4 delivery adds a recent-evidence momentum predictor, weak-skill
prioritization, template-based personalized lesson generation, completion
feedback, and persisted assignments. Each generated lesson includes its reason,
target language, skill, level, source content, coach tip, and estimated time so
the recommendation is understandable to neo-learners and facilitators.

## Speech processing

The frontend uses Web Speech API when supported: speech synthesis provides TTS
and recognition supplies text. It normalizes recognized and target text, then
computes edit-distance similarity. The server validates and stores 0–100
scores; unsupported browsers show a clear practice-only fallback rather than
inventing a score.
