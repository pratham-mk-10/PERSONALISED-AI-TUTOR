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


def format_misconceptions_for_prompt(topic: str | None, include_general: bool = False) -> str:
    records = get_topic_misconceptions(topic, include_general=include_general)
    if not records:
        return "- general_concept_gap: Use only when no single misconception fits clearly."

    return "\n".join(
        f"- {item['tag']}: {item['explanation']}"
        for item in records
    )
