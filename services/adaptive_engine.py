"""Rule-based adaptive learning utilities.

The engine deliberately keeps its decisions explainable for learners and
facilitators.  It can later be replaced by a BKT or ML model without changing
the API routes that call it.
"""
from __future__ import annotations

import secrets
from typing import Any, Dict, Iterable, Optional

SKILLS = ("reading", "writing", "comprehension", "pronunciation")
TIER_THRESHOLDS = ((86, "Advanced"), (66, "Intermediate"), (36, "Elementary"), (0, "Beginner"))


def _answer_score(value: str) -> float:
    """Map onboarding self-assessment answers to a transparent 0–100 value."""
    return {
        "Not yet": 20.0,
        "A little": 55.0,
        "Comfortable": 85.0,
        "I need lots of support": 20.0,
        "I am ready to try": 55.0,
        "I feel confident": 85.0,
    }.get(str(value), 40.0)


def tier_for_score(score: float) -> str:
    for threshold, tier in TIER_THRESHOLDS:
        if score >= threshold:
            return tier
    return "Beginner"


def save_baseline(db: Any, learner_id: int, answers: Dict[str, Any], literacy_scores: Optional[Dict[str, float]] = None) -> None:
    """Seed all core skills after onboarding, retaining an audit-friendly row."""
    confidence = _answer_score(answers.get("confidence"))
    scores = {
        "reading": _answer_score(answers.get("reading")),
        "writing": _answer_score(answers.get("writing")),
        # Initial confidence is a gentle comprehension proxy until a content
        # assessment supplies a direct score.
        "comprehension": confidence,
        "pronunciation": confidence,
    }
    if literacy_scores:
        scores.update({skill: max(0.0, min(100.0, float(score))) for skill, score in literacy_scores.items() if skill in SKILLS})
    for skill, score in scores.items():
        db.execute(
            """INSERT INTO learner_skill_scores (learner_id, skill, mastery_score, attempts, updated_at)
               VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
               ON CONFLICT(learner_id, skill) DO UPDATE SET
                 mastery_score=excluded.mastery_score, attempts=1, updated_at=CURRENT_TIMESTAMP""",
            (learner_id, skill, score),
        )


def record_skill_attempt(db: Any, learner_id: int, skill: str, score: float, duration_seconds: int = 0) -> None:
    """Blend a new result with prior mastery and append a time-based event."""
    if skill not in SKILLS:
        raise ValueError("Unsupported literacy skill.")
    if not 0 <= float(score) <= 100:
        raise ValueError("A skill score must be between 0 and 100.")
    row = db.execute(
        "SELECT mastery_score, attempts FROM learner_skill_scores WHERE learner_id=? AND skill=?",
        (learner_id, skill),
    ).fetchone()
    old_score, attempts = (float(row["mastery_score"]), int(row["attempts"])) if row else (float(score), 0)
    # Recent practice matters most, while historical work still provides stability.
    new_score = round(float(score) if attempts == 0 else old_score * 0.7 + float(score) * 0.3, 1)
    db.execute(
        """INSERT INTO learner_skill_scores (learner_id, skill, mastery_score, attempts, updated_at)
           VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
           ON CONFLICT(learner_id, skill) DO UPDATE SET mastery_score=?, attempts=?, updated_at=CURRENT_TIMESTAMP""",
        (learner_id, skill, new_score, new_score, attempts + 1),
    )
    db.execute(
        "INSERT INTO learning_events (learner_id, event_type, skill, score, duration_seconds) VALUES (?, 'practice', ?, ?, ?)",
        (learner_id, skill, float(score), max(0, int(duration_seconds))),
    )


def adaptive_profile(db: Any, learner_id: int) -> Dict[str, Any]:
    rows = db.execute(
        "SELECT skill, mastery_score, attempts, updated_at FROM learner_skill_scores WHERE learner_id=? ORDER BY skill",
        (learner_id,),
    ).fetchall()
    by_skill = {row["skill"]: dict(row) for row in rows}
    scores: Iterable[float] = [float(row["mastery_score"]) for row in rows]
    overall = round(sum(scores) / len(rows), 1) if rows else 0.0
    weak_skills = sorted(
        (skill for skill in SKILLS if skill not in by_skill or float(by_skill[skill]["mastery_score"]) < 60),
        key=lambda skill: float(by_skill[skill]["mastery_score"]) if skill in by_skill else 0,
    )
    return {
        "overall_score": overall,
        "proficiency_tier": tier_for_score(overall),
        "skill_scores": by_skill,
        "weak_skills": weak_skills,
    }


def proficiency_prediction(db: Any, learner_id: int) -> Dict[str, Any]:
    """Estimate current level and direction from recent evidence.

    This is a lightweight, explainable alternative to BKT for the first release:
    the recent-vs-earlier event average supplies a momentum signal, while the
    skill mastery profile remains the primary prediction.
    """
    profile = adaptive_profile(db, learner_id)
    events = db.execute(
        "SELECT score FROM learning_events WHERE learner_id=? AND score IS NOT NULL ORDER BY id DESC LIMIT 10",
        (learner_id,),
    ).fetchall()
    scores = [float(event["score"]) for event in events]
    recent = sum(scores[:5]) / len(scores[:5]) if scores[:5] else profile["overall_score"]
    earlier = sum(scores[5:]) / len(scores[5:]) if scores[5:] else recent
    momentum = round(recent - earlier, 1)
    predicted_score = round(max(0, min(100, profile["overall_score"] + momentum * 0.2)), 1)
    return {
        "current_score": profile["overall_score"],
        "predicted_score": predicted_score,
        "current_tier": profile["proficiency_tier"],
        "predicted_tier": tier_for_score(predicted_score),
        "momentum": momentum,
        "direction": "improving" if momentum >= 2 else "needs practice" if momentum <= -2 else "steady",
    }


def generate_personalized_lesson(db: Any, learner: Any, requested_skill: Optional[str] = None) -> Dict[str, Any]:
    """Generate a short, explainable lesson from the learner's weakest skill."""
    profile = adaptive_profile(db, learner["id"])
    skill = (requested_skill or (profile["weak_skills"][0] if profile["weak_skills"] else "reading")).lower()
    if skill not in SKILLS:
        raise ValueError("Unsupported lesson skill.")
    language = learner["language"]
    content_row = db.execute("""
        SELECT lessons.title, lessons.content, lessons.estimated_minutes
        FROM lessons JOIN topics ON topics.id=lessons.topic_id
        JOIN courses ON courses.id=topics.course_id
        JOIN languages ON languages.id=courses.language_id
        WHERE languages.name=? ORDER BY lessons.id LIMIT 1 OFFSET ?
    """, (language, int(profile["skill_scores"].get(skill, {}).get("attempts", 0)) % 4)).fetchone()
    source_title = content_row["title"] if content_row else "Everyday words"
    source_content = content_row["content"] if content_row else "Practise a familiar word from daily life."
    minutes = content_row["estimated_minutes"] if content_row else 5
    prompts = {
        "reading": f"Read this aloud twice: {source_content}",
        "writing": f"Write one sentence using the idea from: {source_content}",
        "comprehension": f"Read this and say what it means in your own words: {source_content}",
        "pronunciation": f"Listen, repeat, and record this phrase: {source_content}",
    }
    titles = {"reading": "Guided reading warm-up", "writing": "Everyday writing builder", "comprehension": "Meaning finder", "pronunciation": "Speak with confidence"}
    return {
        "id": secrets.token_urlsafe(12),
        "title": titles[skill],
        "skill": skill,
        "language": language,
        "level": profile["proficiency_tier"],
        "source_lesson": source_title,
        "prompt": prompts[skill],
        "coach_tip": f"This activity is matched to your {skill} practice and {profile['proficiency_tier']} level.",
        "estimated_minutes": minutes,
        "generated_reason": f"Your {skill} score is the next area with the most room to grow.",
    }


def recommendations_for(db: Any, learner: Any) -> Dict[str, Any]:
    """Return a concise, learner-facing recommendation with supporting data."""
    profile = adaptive_profile(db, learner["id"])
    focus = profile["weak_skills"][0] if profile["weak_skills"] else "reading"
    messages = {
        "reading": "Spend a few minutes reading familiar words aloud before starting your next lesson.",
        "writing": "Try a short writing activity next; careful letter-by-letter practice will build confidence.",
        "comprehension": "Choose a short reading passage and answer one question about what it means.",
        "pronunciation": "Use the voice coach before your next lesson to practise clear pronunciation.",
    }
    prediction = proficiency_prediction(db, learner["id"])
    return {
        "profile": profile,
        "priority_skill": focus,
        "message": messages[focus],
        "language": learner["language"],
        "prediction": prediction,
        "actions": [
            {"skill": focus, "label": f"Practise {focus}"},
            {"skill": "reading", "label": "Read aloud"},
            {"skill": "pronunciation", "label": "Try the voice coach"},
        ],
    }
