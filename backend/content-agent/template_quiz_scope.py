def _normalized(value: str | None) -> str:
    return str(value or "").strip()


TEMPLATE_QUIZ_SCOPE = {
    "ReflectionMisconceptionFeedback": {
        "taught_concepts": [
            "angle of incidence is measured from the normal",
            "angle of reflection is measured from the normal",
            "angle of incidence equals angle of reflection",
            "incident ray, reflected ray and normal lie in the same plane",
            "basic ray-diagram reasoning for laws of reflection",
        ],
        "untaught_concepts": [
            "spherical mirror image formation",
            "mirror formula",
            "magnification formula",
            "refraction",
            "lenses",
        ],
    },
    "FirstLawOfReflectionAnimation": {
        "taught_concepts": [
            "angle of incidence is measured from the normal",
            "angle of reflection is measured from the normal",
            "angle of incidence equals angle of reflection",
            "basic ray-diagram reasoning for reflection",
        ],
        "untaught_concepts": [
            "second law coplanarity proofs",
            "spherical mirrors",
            "mirror formula",
            "refraction",
            "lenses",
        ],
    },
    "SecondLawOfReflectionAnimation": {
        "taught_concepts": [
            "incident ray reflected ray and normal lie in same plane",
            "coplanarity rule in reflection",
            "normal is perpendicular at point of incidence",
        ],
        "untaught_concepts": [
            "mirror formula",
            "spherical mirror image formation",
            "refraction",
            "lenses",
        ],
    },
    "PlaneMirrorBasicsAnimation": {
        "taught_concepts": [
            "image in a plane mirror is virtual and erect",
            "image size equals object size in a plane mirror",
            "image distance equals object distance from the mirror",
            "lateral inversion in plane mirror",
            "laws of reflection in plane mirror context",
        ],
        "untaught_concepts": [
            "spherical mirrors",
            "mirror formula",
            "magnification by spherical mirrors",
            "refraction",
            "lenses",
        ],
    },
    "SphericalMirrorBasicsWatch": {
        "taught_concepts": [
            "definition of spherical mirror",
            "difference between concave and convex mirrors",
            "pole principal axis and centre of curvature",
            "principal focus and focal length basic meaning",
            "basic everyday uses of concave and convex mirrors",
        ],
        "untaught_concepts": [
            "mirror formula",
            "magnification formula",
            "sign convention",
            "complex image formation cases for different object positions",
            "numerical problems on spherical mirrors",
        ],
    },
    "SphericalMirrorDetailedAnimation": {
        "taught_concepts": [
            "concave and convex mirror behavior",
            "principal focus and center of curvature",
            "basic image-formation intuition",
            "ray-rule reasoning",
        ],
        "untaught_concepts": [
            "advanced derivations of mirror formula",
            "multi-step numericals",
            "cross-topic lens formula",
            "refraction-heavy mixed problems",
        ],
    },
    "RefractionAnimation": {
        "taught_concepts": [
            "light bends at boundary of two media",
            "bending towards or away from normal based on optical density",
            "basic meaning of refractive index",
            "Snell law qualitative understanding",
            "lateral displacement in rectangular glass slab",
        ],
        "untaught_concepts": [
            "lens formula",
            "power of lens",
            "advanced lens numericals",
            "spherical mirror formula",
        ],
    },
}


DEFAULT_SCOPE = {
    "taught_concepts": [],
    "untaught_concepts": [],
}


def get_template_quiz_scope(svg_component: str | None) -> dict[str, list[str]]:
    template = _normalized(svg_component)
    if not template:
        return dict(DEFAULT_SCOPE)

    profile = TEMPLATE_QUIZ_SCOPE.get(template)
    if not profile:
        return dict(DEFAULT_SCOPE)

    taught = [str(item).strip() for item in profile.get("taught_concepts", []) if str(item).strip()]
    untaught = [str(item).strip() for item in profile.get("untaught_concepts", []) if str(item).strip()]

    return {
        "taught_concepts": taught,
        "untaught_concepts": untaught,
    }
