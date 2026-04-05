const BASE_URL = "http://localhost:8000";

export async function getContent({ subtopic, misconception_tag, attempt }) {
	const response = await fetch(`${BASE_URL}/get-content`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ subtopic, misconception_tag, attempt }),
	});

	if (!response.ok) {
		throw new Error(`Backend error: ${response.status}`);
	}

	return response.json();
}
