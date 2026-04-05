from fastapi import APIRouter

from content_agent.content_service import generate_content


router = APIRouter()


@router.post("/get-content")
def get_content(payload: dict):
	"""Route that connects assessment output to the content engine.

	Expected JSON payload example:
		{
			"subtopic": "laws_of_reflection",
			"misconception_tag": "angle_from_surface",
			"attempt": 2
		}
	"""

	result = generate_content(payload)
	return result
