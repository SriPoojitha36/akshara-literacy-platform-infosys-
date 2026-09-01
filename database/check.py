"""Initialize and verify the local Akshara SQLite database.

Usage:
    python3 database/check.py

Set ``AKSHARA_DATABASE`` to check a different database file.  The command is
safe to run repeatedly: the checked-in schema only uses CREATE IF NOT EXISTS.
Curriculum seed data is added by the Flask application on first request.
"""

from __future__ import annotations

import os
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCHEMA_FILE = ROOT / "database" / "schema.sql"
REQUIRED_TABLES = {
    "learners",
    "languages",
    "learner_languages",
    "courses",
    "topics",
    "lessons",
    "assessments",
    "questions",
    "answers",
    "assessment_results",
    "learning_progress",
    "recommendations",
    "social_accounts",
    "voice_assessments",
    "password_resets",
    "learner_achievements",
    "learner_skill_scores",
    "learning_events",
    "personalized_lessons",
}


def main() -> int:
    """Apply the schema and fail loudly when a required table is missing."""
    database = Path(os.environ.get("AKSHARA_DATABASE", ROOT / "akshara.db")).expanduser()
    database.parent.mkdir(parents=True, exist_ok=True)

    if not SCHEMA_FILE.exists():
        print(f"Schema file not found: {SCHEMA_FILE}", file=sys.stderr)
        return 1

    with sqlite3.connect(database) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))

        # Keep this utility compatible with databases created before the
        # external schema file was introduced. These are additive migrations;
        # no learner data is rewritten or removed.
        learner_migrations = {
            "assessment_completed": "INTEGER NOT NULL DEFAULT 0",
            "assessment_data": "TEXT",
            "streak_days": "INTEGER NOT NULL DEFAULT 1",
            "last_login_date": "TEXT",
            "total_xp": "INTEGER NOT NULL DEFAULT 0",
            "login_count": "INTEGER NOT NULL DEFAULT 1",
        }
        learner_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(learners)")
        }
        for column, declaration in learner_migrations.items():
            if column not in learner_columns:
                connection.execute(f"ALTER TABLE learners ADD COLUMN {column} {declaration}")
        connection.commit()

        tables = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
        missing = sorted(REQUIRED_TABLES - tables)
        if missing:
            print(f"Database verification failed; missing tables: {', '.join(missing)}", file=sys.stderr)
            return 1

        learner_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(learners)")
        }
        required_learner_columns = {
            "assessment_completed",
            "assessment_data",
            "streak_days",
            "total_xp",
            "login_count",
        }
        missing_columns = sorted(required_learner_columns - learner_columns)
        if missing_columns:
            print(
                "Database verification failed; missing learner columns: "
                + ", ".join(missing_columns),
                file=sys.stderr,
            )
            return 1

        learner_count = connection.execute("SELECT COUNT(*) FROM learners").fetchone()[0]
        lesson_count = connection.execute("SELECT COUNT(*) FROM lessons").fetchone()[0]
        print(f"Database ready: {database}")
        print(f"Schema tables: {len(tables)} | learners: {learner_count} | lessons: {lesson_count}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
