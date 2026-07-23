import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/generate-misconception-quiz',
    data=b'{"topic": "laws of reflection", "misconception_tags": ["first_law_reflection_angle", "normal_orientation_wrong"]}',
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    print(json.dumps(json.loads(res.read()), indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read())
