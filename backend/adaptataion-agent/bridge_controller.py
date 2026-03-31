def build_bridge_payload(main_misconception, questions):
	return {
		"main_misconception": main_misconception,
		"questions": questions,
		"bridge_required": main_misconception not in (None, "none"),
	}

