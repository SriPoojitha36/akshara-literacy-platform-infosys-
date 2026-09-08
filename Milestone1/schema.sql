-- Akshara SQLite schema (v1). Safe to run repeatedly during local startup.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS learners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  goal TEXT NOT NULL,
  assessment_completed INTEGER NOT NULL DEFAULT 0,
  assessment_data TEXT,
  streak_days INTEGER NOT NULL DEFAULT 1,
  last_login_date TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  login_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS languages (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, code TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS learner_languages (learner_id INTEGER NOT NULL, language_id INTEGER NOT NULL, is_preferred INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (learner_id, language_id), FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE, FOREIGN KEY (language_id) REFERENCES languages(id));
CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY, language_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, proficiency_level TEXT NOT NULL, FOREIGN KEY (language_id) REFERENCES languages(id));
CREATE TABLE IF NOT EXISTS topics (id INTEGER PRIMARY KEY, course_id INTEGER NOT NULL, title TEXT NOT NULL, sequence_no INTEGER NOT NULL, FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS lessons (id INTEGER PRIMARY KEY, topic_id INTEGER NOT NULL, title TEXT NOT NULL, content TEXT, sequence_no INTEGER NOT NULL, estimated_minutes INTEGER, FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS assessments (id INTEGER PRIMARY KEY, course_id INTEGER, title TEXT NOT NULL, assessment_type TEXT NOT NULL, FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, assessment_id INTEGER NOT NULL, question_text TEXT NOT NULL, question_type TEXT NOT NULL, sequence_no INTEGER NOT NULL, FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS answers (id INTEGER PRIMARY KEY, question_id INTEGER NOT NULL, answer_text TEXT NOT NULL, is_correct INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS assessment_results (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, assessment_id INTEGER, score REAL, recommended_level TEXT, completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE, FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS learning_progress (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, lesson_id INTEGER NOT NULL, completion_percent REAL NOT NULL DEFAULT 0, last_accessed_at TEXT, completed_at TEXT, UNIQUE (learner_id, lesson_id), FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE, FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS recommendations (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, recommendation_type TEXT NOT NULL, content TEXT NOT NULL, is_seen INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS social_accounts (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, UNIQUE(provider, provider_user_id), FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS voice_assessments (id INTEGER PRIMARY KEY, learner_id INTEGER NOT NULL, target_text TEXT NOT NULL, spoken_text TEXT, match_score REAL NOT NULL, evaluated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, token TEXT UNIQUE NOT NULL, expires_at REAL NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS learner_achievements (id INTEGER PRIMARY KEY AUTOINCREMENT, learner_id INTEGER NOT NULL, badge_key TEXT NOT NULL, badge_name TEXT NOT NULL, unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(learner_id, badge_key), FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS learner_skill_scores (learner_id INTEGER NOT NULL, skill TEXT NOT NULL, mastery_score REAL NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (learner_id, skill), FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS learning_events (id INTEGER PRIMARY KEY AUTOINCREMENT, learner_id INTEGER NOT NULL, event_type TEXT NOT NULL, skill TEXT, score REAL, duration_seconds INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS personalized_lessons (id TEXT PRIMARY KEY, learner_id INTEGER NOT NULL, skill TEXT NOT NULL, title TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'assigned', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TEXT, FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS generated_practice_questions (
  token TEXT PRIMARY KEY,
  learner_id INTEGER NOT NULL,
  skill TEXT NOT NULL,
  question_text TEXT NOT NULL,
  choices_json TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at TEXT,
  FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

-- Read-heavy dashboard and adaptive-engine queries use these indexes.
CREATE INDEX IF NOT EXISTS idx_courses_language_level ON courses(language_id, proficiency_level);
CREATE INDEX IF NOT EXISTS idx_topics_course_sequence ON topics(course_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_sequence ON lessons(topic_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_progress_learner ON learning_progress(learner_id, completion_percent);
CREATE INDEX IF NOT EXISTS idx_results_learner_completed ON assessment_results(learner_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_learner_created ON learning_events(learner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_learner_status ON personalized_lessons(learner_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_practice_learner ON generated_practice_questions(learner_id, created_at DESC);
