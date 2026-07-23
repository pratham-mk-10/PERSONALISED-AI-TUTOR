REFLECTION_FEEDBACK_TEMPLATE = "ReflectionMisconceptionFeedback"
PLANE_MIRROR_TEMPLATE = "PlaneMirrorBasicsAnimation"
SPHERICAL_MIRROR_BASICS_TEMPLATE = "SphericalMirrorBasicsWatch"
SPHERICAL_MIRROR_DETAILED_TEMPLATE = "SphericalMirrorDetailedAnimation"
SPHERICAL_MIRROR_IMAGE_TEMPLATE = "SphericalMirrorDetailedAnimation"
SPHERICAL_MIRROR_FEEDBACK_TEMPLATE = "SphericalMirrorMisconceptionFeedback"

REFLECTION_TAGS = {
    "angle_from_surface",
    "reflection_not_equal",
    "normal_orientation_wrong",
    "plane_not_same",
    "first_law_reflection_angle",
    "second_law_reflection_plane",
}

PLANE_MIRROR_TAGS = {
    "image_real_confusion",
    "size_mismatch",
    "distance_confusion",
    "lateral_inversion_confusion",
    "plane_mirror_image_properties",
    "regular_vs_diffused_confusion",
}

SPHERICAL_MIRROR_BASICS_TAGS = {
    "concave_convex_confusion",
    "pole_confusion",
    "center_of_curvature_confusion",
    "principal_axis_confusion",
    "focus_definition_wrong",
    "focus_convex_confusion",
    "radius_focal_relation_wrong",
    "sign_convention_confusion",
    "left_right_sign_error",
    "mirror_formula_sign_error",
    "magnification_sign_error",
}

SPHERICAL_MIRROR_RAY_RULE_TAGS = {
    "parallel_ray_rule_wrong",
    "focus_ray_rule_wrong",
    "center_ray_rule_wrong",
    "random_reflection",
}

SPHERICAL_MIRROR_IMAGE_TAGS = {
    "image_position_confusion",
    "real_virtual_confusion",
    "image_size_confusion",
    "inverted_erect_confusion",
    "focus_infinity_confusion",
    "beyond_c_confusion",
    "convex_real_image_myth",
    "convex_size_confusion",
    "rearview_reason_wrong",
}


def _normalized(value: str | None) -> str:
    return str(value or "").strip().lower()


def pick_svg_variant(misconception_tag: str | None) -> str:
    tag = _normalized(misconception_tag)
    if tag in (
        REFLECTION_TAGS
        | PLANE_MIRROR_TAGS
        | SPHERICAL_MIRROR_BASICS_TAGS
        | SPHERICAL_MIRROR_RAY_RULE_TAGS
        | SPHERICAL_MIRROR_IMAGE_TAGS
    ):
        return tag
    return "general_concept_gap"


def pick_svg_template(subtopic: str | None, misconception_tag: str | None = None) -> str:
    topic = _normalized(subtopic)
    tag = _normalized(misconception_tag)

    if tag in REFLECTION_TAGS:
        return REFLECTION_FEEDBACK_TEMPLATE
    if tag in PLANE_MIRROR_TAGS:
        return PLANE_MIRROR_TEMPLATE
    if tag in SPHERICAL_MIRROR_BASICS_TAGS:
        return SPHERICAL_MIRROR_FEEDBACK_TEMPLATE
    if tag in SPHERICAL_MIRROR_RAY_RULE_TAGS:
        return SPHERICAL_MIRROR_FEEDBACK_TEMPLATE
    if tag in SPHERICAL_MIRROR_IMAGE_TAGS:
        return SPHERICAL_MIRROR_FEEDBACK_TEMPLATE

    if "plane mirror" in topic:
        return PLANE_MIRROR_TEMPLATE
    if "spherical" in topic or "concave" in topic or "convex" in topic:
        return SPHERICAL_MIRROR_DETAILED_TEMPLATE
    if "first law" in topic or "reflection" in topic:
        return "FirstLawOfReflectionAnimation"
    if "second law" in topic:
        return "SecondLawOfReflectionAnimation"
    if "refraction" in topic:
        return "RefractionAnimation"
    return "ConceptOverview"
