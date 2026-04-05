import os

import openai


def generate_explanation(misconception_tag: str) -> str:
	"""Generate a short explanation for a given reflection misconception.

	Focused only on laws of reflection misconceptions for now.
	"""

	# Expect OPENAI_API_KEY to be configured in the environment.
	# This keeps credentials out of source control.
	api_key = os.getenv("OPENAI_API_KEY")
	if api_key:
		openai.api_key = api_key

	prompt = f"""
	A student has this misconception in reflection of light:
	{misconception_tag}

	Explain:
	- What mistake they made
	- What is correct (based on laws of reflection)
	Keep it simple (80-100 words).
	"""

	response = openai.ChatCompletion.create(
		model="gpt-4o-mini",
		messages=[{"role": "user", "content": prompt}],
		max_tokens=120,
	)

	return response.choices[0].message.content.strip()
