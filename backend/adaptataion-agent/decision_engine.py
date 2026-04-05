def choose_next_action(main_misconception):
	if main_misconception and main_misconception != "none":
		return "targeted_questions"
	return "mixed_questions"

