def classify_level(student):
	attempts = student.get("attempts", 0)
	total_mis = sum((student.get("misconceptions") or {}).values())

	accuracy = 1 - (total_mis / attempts if attempts else 0)

	if accuracy < 0.4:
		return "beginner"
	if accuracy < 0.7:
		return "intermediate"
	return "advanced"

