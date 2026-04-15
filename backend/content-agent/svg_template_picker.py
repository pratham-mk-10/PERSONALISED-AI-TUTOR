def pick_svg_template(subtopic: str | None) -> str:
    topic = str(subtopic or "").strip().lower()

    if "first law" in topic:
        return "FirstLawOfReflectionAnimation"
    if "second law" in topic:
        return "SecondLawOfReflectionAnimation"
    if "reflection" in topic:
        return "FirstLawOfReflectionAnimation"
    if "refraction" in topic:
        return "RefractionAnimation"
    return "ConceptOverview"
