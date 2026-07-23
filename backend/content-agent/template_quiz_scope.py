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
        # Corrected: this component only covers ray-diagram vocabulary
        # (mirror, point of incidence, incident/reflected ray, normal,
        # angle of incidence/reflection). Image-characteristic concepts were
        # previously claimed here but were never actually in the lesson --
        # that content now lives in PlaneMirrorCharacteristicsAnimation below.
        "taught_concepts": [
            "definition of a plane mirror",
            "point of incidence, incident ray, reflected ray, normal",
            "angle of incidence and angle of reflection measured from the normal",
            "standard ray-diagram vocabulary for plane mirrors",
        ],
        "untaught_concepts": [
            "image characteristics of a plane mirror",
            "lateral inversion",
            "regular vs diffused reflection",
            "spherical mirrors",
            "mirror formula",
            "magnification by spherical mirrors",
            "refraction",
            "lenses",
        ],
    },
    "PlaneMirrorCharacteristicsAnimation": {
        "taught_concepts": [
            "image in a plane mirror is virtual and erect",
            "image size equals object size in a plane mirror",
            "image distance equals object distance from the mirror",
            "lateral inversion in plane mirror",
            "regular reflection vs diffused reflection, and that individual rays obey the law of reflection in both",
        ],
        "untaught_concepts": [
            "spherical mirrors",
            "mirror formula",
            "magnification by spherical mirrors",
            "refraction",
            "lenses",
        ],
    },
    "PlaneMirrorApplicationsAnimation": {
        "taught_concepts": [
            "why AMBULANCE is written reversed, using lateral inversion in a rear-view mirror",
            "symmetric letters (A, H, I, M, O, T, U) that look identical to their own mirror image, vs asymmetric letters that visibly flip",
            "multiple images formed by two plane mirrors at an angle theta: number of images = (360/theta) - 1",
            "kaleidoscope as two mirrors at 60 degrees",
            "periscope as two mirrors at 45 degrees, each bending the ray 90 degrees",
        ],
        "untaught_concepts": [
            "spherical mirrors",
            "mirror formula",
            "magnification by spherical mirrors",
            "refraction",
            "lenses",
        ],
    },
    "RealVsVirtualImagesAnimation": {
        "taught_concepts": [
            "a real image forms where light rays actually converge and can be caught on a screen",
            "a real image is inverted",
            "a virtual image forms where light rays only appear to diverge from, traced backward",
            "a virtual image cannot be caught on a screen and is erect",
        ],
        "untaught_concepts": [
            "spherical mirror image formation cases",
            "mirror formula",
            "magnification",
            "sign convention",
            "refraction",
            "lenses",
        ],
    },
    "SphericalMirrorUsesAnimation": {
        "taught_concepts": [
            "concave mirror used in shaving/makeup mirrors and dentist mirrors because object between F and P gives a magnified virtual image",
            "concave mirror used in torches/headlights/searchlights because a source at the focus reflects as a parallel beam",
            "concave mirror used in solar furnaces/cookers because parallel incoming rays converge at the focus",
            "convex mirror used in rear-view and side mirrors because it always gives a virtual erect diminished image with a wider field of view",
            "concave mirror used in an ENT doctor's head mirror, same physics as the shaving mirror, to concentrate light into the ear, nose, or throat",
            "concave mirror used in reflecting telescopes, same physics as the solar cooker, to converge faint starlight at the focus",
            "convex mirror used in road-safety mirrors at blind curves, shop security mirrors, and ATM mirrors, same physics as the rear-view mirror, for a wider field of view",
        ],
        "untaught_concepts": [
            "mirror formula",
            "magnification formula",
            "sign convention",
            "numerical problems on spherical mirrors",
            "refraction",
            "lenses",
        ],
    },
    "SignConventionLesson": {
        "taught_concepts": [
            "distances measured from the pole under the New Cartesian sign convention",
            "object distance u is always negative",
            "concave mirror focal length is negative, convex mirror focal length is positive",
            "real image distance is negative, virtual image distance is positive",
            "erect image height is positive, inverted image height is negative",
        ],
        "untaught_concepts": [
            "mirror formula derivation",
            "magnification numericals",
            "refraction",
            "lenses",
        ],
    },
    "MirrorFormulaLesson": {
        "taught_concepts": [
            "mirror formula 1/v + 1/u = 1/f",
            "magnification m = h'/h = -v/u and interpreting its sign and magnitude",
            "worked examples applying the sign convention to find image position and nature",
        ],
        "untaught_concepts": [
            "refraction",
            "lens formula",
            "power of a lens",
            "multi-step combined numericals",
        ],
    },
    "IntroToLightAnimation": {
        "taught_concepts": [
            "light is a form of energy that enables sight",
            "luminous vs non-luminous objects",
            "transparent, translucent, and opaque materials",
            "rectilinear propagation of light",
            "ray vs beam (parallel, convergent, divergent)",
        ],
        "untaught_concepts": [
            "laws of reflection",
            "mirrors",
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
            "distinguishing concave, convex, and plane mirrors by looking at your reflection close up (magnified vs diminished vs same size)",
            "distinguishing concave and convex mirrors by touch (depressed inward vs bulging outward)",
            "the spoon analogy: inner hollow surface behaves like a concave mirror, outer bulging back behaves like a convex mirror",
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
    "RefractionIntroAnimation": {
        "taught_concepts": [
            "light bends at boundary of two media",
            "incident ray refracted ray and normal",
            "angles measured from normal",
            "bending toward normal entering denser medium",
        ],
        "untaught_concepts": ["Snell law derivation", "lens formula", "glass slab numericals"],
    },
    "SnellsLawAnimation": {
        "taught_concepts": [
            "Snell law formula",
            "coplanarity of rays and normal",
            "rarer to denser toward normal",
            "denser to rarer away from normal",
        ],
        "untaught_concepts": ["lens formula", "mirror formula"],
    },
    "GlassSlabAnimation": {
        "taught_concepts": [
            "emergent ray parallel to incident ray",
            "lateral displacement",
            "double refraction at slab faces",
        ],
        "untaught_concepts": ["lens formula", "lens image formation"],
    },
    "SphericalLensesAnimation": {
        "taught_concepts": [
            "convex vs concave lens",
            "optical centre and principal focus",
            "converging vs diverging lenses",
        ],
        "untaught_concepts": ["lens formula numericals", "mirror formula"],
    },
    "LensImageFormationAnimation": {
        "taught_concepts": [
            "convex lens real and virtual images",
            "concave lens virtual diminished image",
            "lens ray tracing rules",
        ],
        "untaught_concepts": ["lens formula calculation", "mirror formula"],
    },
    "LensFormulaAnimation": {
        "taught_concepts": [
            "lens formula",
            "magnification",
            "power of lens in dioptre",
            "sign convention for lenses",
        ],
        "untaught_concepts": ["mirror formula", "spherical mirror images"],
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
