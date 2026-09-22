-- Akshara PostgreSQL schema. Used automatically when DATABASE_URL is set.
CREATE TABLE IF NOT EXISTS learners (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL,
  email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, language TEXT NOT NULL,
  proficiency TEXT NOT NULL, goal TEXT NOT NULL, assessment_completed INTEGER NOT NULL DEFAULT 0,
  assessment_data TEXT, streak_days INTEGER NOT NULL DEFAULT 1, last_login_date TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0, login_count INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS languages (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, code TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS learner_languages (learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, language_id BIGINT NOT NULL REFERENCES languages(id), is_preferred INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (learner_id, language_id));
CREATE TABLE IF NOT EXISTS courses (id BIGSERIAL PRIMARY KEY, language_id BIGINT NOT NULL REFERENCES languages(id), title TEXT NOT NULL, description TEXT, proficiency_level TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS topics (id BIGSERIAL PRIMARY KEY, course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, title TEXT NOT NULL, sequence_no INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS lessons (id BIGSERIAL PRIMARY KEY, topic_id BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE, title TEXT NOT NULL, content TEXT, sequence_no INTEGER NOT NULL, estimated_minutes INTEGER);
CREATE TABLE IF NOT EXISTS assessments (id BIGSERIAL PRIMARY KEY, course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL, title TEXT NOT NULL, assessment_type TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS questions (id BIGSERIAL PRIMARY KEY, assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE, question_text TEXT NOT NULL, question_type TEXT NOT NULL, sequence_no INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS answers (id BIGSERIAL PRIMARY KEY, question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE, answer_text TEXT NOT NULL, is_correct INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS assessment_results (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, assessment_id BIGINT REFERENCES assessments(id) ON DELETE SET NULL, score DOUBLE PRECISION, recommended_level TEXT, completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS learning_progress (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE, completion_percent DOUBLE PRECISION NOT NULL DEFAULT 0, last_accessed_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, UNIQUE (learner_id, lesson_id));
CREATE TABLE IF NOT EXISTS recommendations (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, recommendation_type TEXT NOT NULL, content TEXT NOT NULL, is_seen INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS social_accounts (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, UNIQUE(provider, provider_user_id));
CREATE TABLE IF NOT EXISTS voice_assessments (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, target_text TEXT NOT NULL, spoken_text TEXT, match_score DOUBLE PRECISION NOT NULL, evaluated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS password_resets (id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL, token TEXT UNIQUE NOT NULL, expires_at DOUBLE PRECISION NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS learner_achievements (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, badge_key TEXT NOT NULL, badge_name TEXT NOT NULL, unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(learner_id, badge_key));
CREATE TABLE IF NOT EXISTS learner_skill_scores (learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, skill TEXT NOT NULL, mastery_score DOUBLE PRECISION NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (learner_id, skill));
CREATE TABLE IF NOT EXISTS learning_events (id BIGSERIAL PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, event_type TEXT NOT NULL, skill TEXT, score DOUBLE PRECISION, duration_seconds INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS personalized_lessons (id TEXT PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, skill TEXT NOT NULL, title TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'assigned', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS generated_practice_questions (token TEXT PRIMARY KEY, learner_id BIGINT NOT NULL REFERENCES learners(id) ON DELETE CASCADE, skill TEXT NOT NULL, question_text TEXT NOT NULL, choices_json TEXT NOT NULL, correct_answer TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, answered_at TIMESTAMPTZ);

CREATE INDEX IF NOT EXISTS idx_courses_language_level ON courses(language_id, proficiency_level);
CREATE INDEX IF NOT EXISTS idx_topics_course_sequence ON topics(course_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_sequence ON lessons(topic_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_progress_learner ON learning_progress(learner_id, completion_percent);
CREATE INDEX IF NOT EXISTS idx_results_learner_completed ON assessment_results(learner_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_learner_created ON learning_events(learner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_learner_status ON personalized_lessons(learner_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_practice_learner ON generated_practice_questions(learner_id, created_at DESC);
