from __future__ import annotations

from typing import Any

from database.connection import get_connection


def _normalize_text(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def topic_key_for(topic: str | None) -> str:
    text = _normalize_text(topic)
    if not text:
        return "general"
    if "plane mirror" in text:
        return "plane_mirror"
    if "sign convention" in text:
        return "spherical_mirrors"
    if "concave" in text or "convex" in text or "spherical mirror" in text:
        return "spherical_mirrors"
    if "focus" in text or "principal axis" in text or "centre of curvature" in text or "center of curvature" in text or "pole" in text or "mirror formula" in text or "focal length" in text or "ray diagram" in text:
        return "spherical_mirrors"
    if "first law" in text or "second law" in text or "laws of reflection" in text or "reflection" in text:
        return "laws_of_reflection"
    if "refraction" in text:
        return "refraction"
    return "general"


def get_topic_misconceptions(topic: str | None, include_general: bool = True, source: str = "db") -> list[dict[str, Any]]:
    topic_key = topic_key_for(topic)

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT topic_key, tag, title, explanation, focus_area, sort_order
            FROM topic_misconceptions
            WHERE topic_key = %s OR (%s AND topic_key = 'general')
            ORDER BY sort_order, id
            """,
            (topic_key, include_general),
        )
        rows = cur.fetchall()
        conn.close()
        return [
            {
                "topic_key": row[0],
                "tag": row[1],
                "title": row[2],
                "explanation": row[3],
                "focus_area": row[4],
                "sort_order": row[5],
            }
            for row in rows
        ]
    except Exception:
        return []


def get_allowed_misconception_tags(topic: str | None, include_general: bool = True) -> list[str]:
    return [item["tag"] for item in get_topic_misconceptions(topic, include_general=include_general)]


def get_misconception_metadata(tag: str | None) -> dict[str, Any] | None:
    if not tag:
        return None

    normalized = str(tag).strip()
    if not normalized:
        return None

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT topic_key, tag, title, explanation, focus_area, sort_order
            FROM topic_misconceptions
            WHERE tag = %s
            LIMIT 1
            """,
            (normalized,),
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return None

        return {
            "topic_key": row[0],
            "tag": row[1],
            "title": row[2],
            "explanation": row[3],
            "focus_area": row[4],
            "sort_order": row[5],
        }
    except Exception:
        return None


def coerce_misconception_tag(tag: str | None, topic: str | None = None, fallback: str = "general_concept_gap") -> str:
    candidate = str(tag or "").strip()
    allowed = get_allowed_misconception_tags(topic)

    if candidate and candidate in allowed:
        return candidate
    if fallback in allowed:
        return fallback
    return allowed[0] if allowed else fallback


def format_misconceptions_for_prompt(topic: str | None, include_general: bool = True) -> str:
    records = get_topic_misconceptions(topic, include_general=include_general)
    if not records:
        return "- general_concept_gap: Use only when no single misconception fits clearly."

    return "\n".join(
        f"- {item['tag']}: {item['explanation']}"
        for item in records
    )
