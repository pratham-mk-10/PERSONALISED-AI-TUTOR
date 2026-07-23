from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from database.connection import get_connection

TAG_TO_TOPIC_KEY = {
    "general_concept_gap": "general",
    "first_law_reflection_angle": "laws_of_reflection",
    "second_law_reflection_plane": "laws_of_reflection",
    "plane_mirror_image_properties": "plane_mirror",
    "refraction_bending_normal": "refraction",
    "angle_from_surface": "laws_of_reflection",
    "reflection_not_equal": "laws_of_reflection",
    "normal_orientation_wrong": "laws_of_reflection",
    "plane_not_same": "laws_of_reflection",
    "concave_convex_confusion": "spherical_mirrors",
    "pole_confusion": "spherical_mirrors",
    "center_of_curvature_confusion": "spherical_mirrors",
    "radius_focal_relation_wrong": "spherical_mirrors",
    "principal_axis_confusion": "spherical_mirrors",
    "focus_definition_wrong": "spherical_mirrors",
    "image_position_wrong": "spherical_mirrors",
    "image_size_wrong": "spherical_mirrors",
    "image_nature_wrong": "spherical_mirrors",
    "ray_tracing_rule_violation": "spherical_mirrors",
    "convex_real_image_myth": "spherical_mirrors",
    "convex_size_confusion": "spherical_mirrors",
    "real_virtual_confusion": "spherical_mirrors",
    "image_position_confusion": "spherical_mirrors",
    "image_size_confusion": "spherical_mirrors",
    "inverted_erect_confusion": "spherical_mirrors",
    "focus_infinity_confusion": "spherical_mirrors",
    "beyond_c_confusion": "spherical_mirrors",
    "parallel_ray_rule_wrong": "spherical_mirrors",
    "focus_ray_rule_wrong": "spherical_mirrors",
    "center_ray_rule_wrong": "spherical_mirrors",
    "sign_convention_confusion": "spherical_mirrors",
    "image_real_confusion": "plane_mirror",
    "size_mismatch": "plane_mirror",
    "distance_confusion": "plane_mirror",
    "lateral_inversion_confusion": "plane_mirror",
    "regular_vs_diffused_confusion": "plane_mirror",
    "rearview_reason_wrong": "spherical_mirrors",
    "mirror_formula_sign_error": "spherical_mirrors",
    "magnification_sign_error": "spherical_mirrors",
}


def _load_local_misconceptions_json():
    try:
        json_path = Path(__file__).resolve().parents[2] / "shared" / "misconception_tags.json"
        if not json_path.exists():
            json_path = Path(__file__).resolve().parents[1] / "shared" / "misconception_tags.json"
        if json_path.exists():
            with open(json_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print("Error loading local misconceptions JSON:", e)
    return {}


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

    # ALWAYS prefer local JSON file to ensure robust, uncorrupted tags and explanations
    local_data = _load_local_misconceptions_json()
    if local_data:
        results = []
        for tag, details in local_data.items():
            t_key = TAG_TO_TOPIC_KEY.get(tag)
            if not t_key:
                t_key = "general"
                if "refraction" in tag or "lens" in tag:
                    t_key = "refraction"
                elif "mirror" in tag or "convex" in tag or "concave" in tag:
                    t_key = "spherical_mirrors"
                elif "reflection" in tag or "angle" in tag:
                    t_key = "laws_of_reflection"
            
            if t_key in topic_keys or (include_general and t_key == "general"):
                results.append({
                    "topic_key": t_key,
                    "tag": tag,
                    "title": details.get("title", tag.replace("_", " ").title()),
                    "explanation": details.get("explanation", ""),
                    "focus_area": details.get("focus_area", ""),
                    "sort_order": 0,
                })
        
        if results:
            return results

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
        if not rows:
            return []
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
        if not records:
            return _shared_records(topic_keys, include_general)

        if allowed_tags:
            records = [item for item in records if item["tag"] in allowed_tags]
            if records:
                return records

        return _shared_records(topic_keys, include_general)
    except Exception:
        local_data = _load_local_misconceptions_json()
        results = []
        for tag, details in local_data.items():
            t_key = TAG_TO_TOPIC_KEY.get(tag)
            if not t_key:
                t_key = "general"
                if "refraction" in tag or "lens" in tag:
                    t_key = "refraction"
                elif "mirror" in tag or "convex" in tag or "concave" in tag:
                    t_key = "spherical_mirrors"
                elif "reflection" in tag or "angle" in tag:
                    t_key = "laws_of_reflection"
            
            if t_key in topic_keys or (include_general and t_key == "general"):
                results.append({
                    "topic_key": t_key,
                    "tag": tag,
                    "title": details.get("title", tag.replace("_", " ").title()),
                    "explanation": details.get("explanation", ""),
                    "focus_area": details.get("focus_area", ""),
                    "sort_order": 0,
                })
        return results


def get_allowed_misconception_tags(topic: str | None, include_general: bool = False) -> list[str]:
    return [item["tag"] for item in get_topic_misconceptions(topic, include_general=include_general)]


def get_misconception_metadata(tag: str | None) -> dict[str, Any] | None:
    if not tag:
        return None

    normalized = str(tag).strip()
    if not normalized:
        return None

    # ALWAYS prefer local JSON file to ensure robust, uncorrupted fallback text
    local_data = _load_local_misconceptions_json()
    if normalized in local_data:
        details = local_data[normalized]
        t_key = TAG_TO_TOPIC_KEY.get(normalized)
        if not t_key:
            t_key = "general"
            if "refraction" in normalized or "lens" in normalized:
                t_key = "refraction"
            elif "mirror" in normalized or "convex" in normalized or "concave" in normalized:
                t_key = "spherical_mirrors"
            elif "reflection" in normalized or "angle" in normalized:
                t_key = "laws_of_reflection"
        return {
            "topic_key": t_key,
            "tag": normalized,
            "title": details.get("title", normalized.replace("_", " ").title()),
            "explanation": details.get("explanation", ""),
            "focus_area": details.get("focus_area", ""),
            "sort_order": 0,
        }

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
    return fallback


# Exact `unresolved_topics` title -> TAG_TO_TOPIC_KEY vocabulary key.
# Unlike topic_keys_for() (which deliberately aliases "Laws of Reflection"
# across sibling reflection-family topics for allowed-tag-lookup purposes),
# this is a strict 1:1 mapping so a misconception tag counted toward one
# topic's weakness score can never leak into a sibling topic's score.
UNRESOLVED_TOPIC_TITLE_TO_KEY = {
    "Introduction to Light": "general",
    "Laws of Reflection": "laws_of_reflection",
    "Plane Mirror Basics": "plane_mirror",
    "Real vs Virtual Images": "spherical_mirrors",
    "Spherical Mirror Basics": "spherical_mirrors",
    "Ray Tracing Rules of Spherical Mirrors": "spherical_mirrors",
    "Image Formation by Spherical Mirrors": "spherical_mirrors",
    "Uses of Concave and Convex Mirrors": "spherical_mirrors",
    "Mirror Formula and Magnification": "spherical_mirrors",
    "Numerical Problems: Find v": "spherical_mirrors",
    "Numerical Problems: Find Height / Magnification": "spherical_mirrors",
    "Numerical Problems: Find f": "spherical_mirrors",
    "Numerical Problems: Find u": "spherical_mirrors",
    "Numerical Problems: Mirror Identification": "spherical_mirrors",
    "Numerical Problems: Combined": "spherical_mirrors",
    "Introduction to Refraction": "refraction",
}


# Severity thresholds for a topic's summed misconception count.
# Applied per-topic on its own merit (not by rank), so every struggling topic
# gets an honest color instead of only the single worst one standing out.
RED_SEVERITY_THRESHOLD = 3   # total_count >= 3 -> "red"
YELLOW_SEVERITY_THRESHOLD = 1  # total_count 1-2 -> "yellow"

# Cap how many distinct misconception tags feed a single topic's retest quiz.
# Keeps the LLM prompt focused instead of diluting across every tag ever seen.
MAX_TAGS_PER_TOPIC_BREAKDOWN = 3


def _severity_for_count(total_count: int) -> str:
    if total_count >= RED_SEVERITY_THRESHOLD:
        return "red"
    if total_count >= YELLOW_SEVERITY_THRESHOLD:
        return "yellow"
    return "green"


def summarize_persistent_weaknesses(
    misconceptions: dict[str, int] | None,
    unresolved_topics: list[str] | None,
) -> list[dict[str, Any]]:
    """Rank every unresolved topic by its summed misconception count.

    Each entry belongs strictly to one topic (via UNRESOLVED_TOPIC_TITLE_TO_KEY,
    no cross-topic aliasing) so a resolved sibling topic's tags never leak in.
    Returns entries sorted by total_count descending (most struggled first).
    Severity ("red"/"yellow") is computed per-topic from its own total_count
    via `_severity_for_count`, not from rank, so every unresolved topic gets
    an honest color rather than only the single worst one being flagged.
    `tag_breakdown` carries up to MAX_TAGS_PER_TOPIC_BREAKDOWN tags sorted by
    count desc, so callers can weight a retest quiz across every misconception
    the student actually tripped on, not just the single most frequent one.
    `weak_tag`/`weak_tag_title` are kept for backward compatibility and are
    always the top entry of `tag_breakdown`. Empty list if nothing unresolved.
    """
    if not unresolved_topics:
        return []

    misconceptions = misconceptions or {}
    results: list[dict[str, Any]] = []

    for topic_title in unresolved_topics:
        topic_key = UNRESOLVED_TOPIC_TITLE_TO_KEY.get(topic_title) or topic_key_for(topic_title)
        matching = [
            (tag, count)
            for tag, count in misconceptions.items()
            if TAG_TO_TOPIC_KEY.get(tag) == topic_key
        ]
        total = sum(count for _, count in matching)
        matching.sort(key=lambda item: item[1], reverse=True)
        top_tags = matching[:MAX_TAGS_PER_TOPIC_BREAKDOWN]

        tag_breakdown = []
        for tag, count in top_tags:
            meta = get_misconception_metadata(tag)
            tag_breakdown.append(
                {
                    "tag": tag,
                    "tag_title": (meta or {}).get("title") or tag.replace("_", " ").title(),
                    "count": count,
                }
            )

        top_tag = tag_breakdown[0]["tag"] if tag_breakdown else None
        weak_tag_title = tag_breakdown[0]["tag_title"] if tag_breakdown else None

        results.append(
            {
                "topic_title": topic_title,
                "weak_tag": top_tag,
                "weak_tag_title": weak_tag_title,
                "tag_breakdown": tag_breakdown,
                "total_count": total,
            }
        )

    results.sort(key=lambda r: r["total_count"], reverse=True)
    for r in results:
        # An unresolved topic is never "green" even if none of its tripped
        # tags happen to map into TAG_TO_TOPIC_KEY (total_count == 0) --
        # unresolved by definition means at least one outstanding gap.
        r["severity"] = _severity_for_count(r["total_count"]) if r["total_count"] > 0 else "yellow"

    return results


def get_topic_status_map(
    misconceptions: dict[str, int] | None,
    completed_topics: list[str] | None,
    unresolved_topics: list[str] | None,
) -> dict[str, str]:
    """Return {topic_title: "green"|"yellow"|"red"} for every topic the
    student has attempted (completed or unresolved), so the Dashboard can
    color every topic card, not just the ones offered as a retest.

    Completed topics are always "green" regardless of past misconception
    count — resolution means the student got it right most recently.
    Unresolved topics reuse the same per-topic severity threshold as
    `summarize_persistent_weaknesses` (never "green", since an unresolved
    topic by definition still has at least one outstanding misconception).
    Topics the student hasn't touched at all are simply absent from the map.
    """
    status: dict[str, str] = {}

    for topic_title in completed_topics or []:
        status[topic_title] = "green"

    weaknesses = summarize_persistent_weaknesses(misconceptions, unresolved_topics)
    for entry in weaknesses:
        status[entry["topic_title"]] = entry["severity"]

    return status


def format_misconceptions_for_prompt(topic: str | None, include_general: bool = False) -> str:
    records = get_topic_misconceptions(topic, include_general=include_general)
    if not records:
        return "- general_concept_gap: Use only when no single misconception fits clearly."

    return "\n".join(
        f"- {item['tag']}: {item['explanation']}"
        for item in records
    )
