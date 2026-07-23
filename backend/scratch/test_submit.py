import urllib.request
import json

data = {
    "student_id": "test_user",
    "topic": "laws of reflection",
    "attempt_number": 1,
    "answers": [
        {
            "question_id": 1,
            "question_text": "A ray of light strikes a plane mirror...",
            "selected": 1,
            "correct": 0,
            "misconception_map": {
                "1": "general_concept_gap",
                "2": "normal_orientation_wrong"
            },
            "options": ["Correct", "Wrong1", "Wrong2", "Wrong3"]
        }
    ]
}

req = urllib.request.Request(
    'http://localhost:8000/submit-answers',
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print(json.dumps(json.loads(res.read()), indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read())
