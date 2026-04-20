from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from database.connection import get_connection


ROOT = Path(__file__).resolve().parents[2]
SHARED_TAGS_FILE = ROOT / "shared" / "misconception_tags.json"


def _normalize_text(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def topic_key_for(topic: str | None) -> str:
    text = _normalize_text(topic)
    if not text:
        return "general"
    if "reflection of light" in text or "9.1" in text or "9.2" in text:
        return "reflection_of_light"
    if "plane mirror" in text:
        return "plane_mirror"
    if "sign convention" in text:
        return "spherical_mirrors"
    if "concave" in text or "convex" in text or "spherical mirror" in text:
        return "spherical_mirrors"
    if "focus" in text or "principal axis" in text or "centre of curvature" in text or "center of curvature" in text or "pole" in text or "mirror formula" in text or "focal length" in text or "ray diagram" in text:
        return "spherical_mirrors"
    if "first law" in text or "second law" in text or "laws of reflection" in text or "reflection" in text:
        return "reflection_of_light"
    if "refraction" in text:
        return "refraction"
    return "general"


def topic_keys_for(topic: str | None) -> list[str]:
    topic_key = topic_key_for(topic)
    if topic_key == "reflection_of_light":
        return [
            "reflection_of_light",
            "laws_of_reflection",
            "plane_mirror",
            "spherical_mirrors",
        ]
    return [topic_key]


def _load_shared_catalog() -> dict[str, dict[str, Any]]:
    try:
        with open(SHARED_TAGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except Exception:
        pass
    return {}


def _shared_records(topic_keys: list[str], include_general: bool) -> list[dict[str, Any]]:
    data = _load_shared_catalog()
    records: list[dict[str, Any]] = []
    for index, (tag, item) in enumerate(data.items()):
        if not isinstance(item, dict):
            continue
        record_topic_key = str(item.get("topic_key") or "").strip() or "general"
        if record_topic_key not in topic_keys and not (include_general and record_topic_key == "general"):
            continue
        records.append(
            {
                "topic_key": record_topic_key,
                "tag": tag,
                "title": item.get("title", ""),
                "explanation": item.get("explanation", ""),
                "focus_area": item.get("focus_area", ""),
                "sort_order": int(item.get("sort_order", index)),
            }
        )
    return records


def _allowed_tags_from_shared(topic_keys: list[str], include_general: bool) -> set[str]:
    return {item["tag"] for item in _shared_records(topic_keys, include_general)}


def get_topic_misconceptions(topic: str | None, include_general: bool = False, source: str = "db") -> list[dict[str, Any]]:
    topic_keys = topic_keys_for(topic)
    db_keys = list(topic_keys)
    if include_general:
        db_keys.append("general")
    allowed_tags = _allowed_tags_from_shared(topic_keys, include_general)

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT topic_key, tag, title, explanation, focus_area, sort_order
            FROM topic_misconceptions
            WHERE topic_key = ANY(%s)
            ORDER BY sort_order, id
            """,
            (db_keys,),
        )
        rows = cur.fetchall()
        conn.close()
        records = [
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
        if not records:
            return _shared_records(topic_keys, include_general)

        if allowed_tags:
            records = [item for item in records if item["tag"] in allowed_tags]
            if records:
                return records

        return _shared_records(topic_keys, include_general)
    except Exception:
        return _shared_records(topic_keys, include_general)


def get_allowed_misconception_tags(topic: str | None, include_general: bool = False) -> list[str]:
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


def format_misconceptions_for_prompt(topic: str | None, include_general: bool = False) -> str:
    records = get_topic_misconceptions(topic, include_general=include_general)
    if not records:
        return "- general_concept_gap: Use only when no single misconception fits clearly."

    return "\n".join(
        f"- {item['tag']}: {item['explanation']}"
        for item in records
    )
