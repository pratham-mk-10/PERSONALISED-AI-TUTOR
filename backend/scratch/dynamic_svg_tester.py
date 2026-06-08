import os
import sys
import json
import urllib.request as request
from dotenv import load_dotenv

# Ensure we can import from backend
import importlib.util
spec = importlib.util.spec_from_file_location('sp', os.path.abspath(os.path.join(os.path.dirname(__file__), '../content-agent/super_prompt_svg.py')))
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)
get_dynamic_svg_super_prompt = sp.get_dynamic_svg_super_prompt

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')))
gemini_key = os.getenv('GEMINI_API_KEY', '').strip()

if not gemini_key:
    print("No GEMINI_API_KEY found.")
    sys.exit(1)

test_cases = [
    {
        "name": "Case_1_Beyond_C",
        "tag": "image_position_wrong",
        "u": "-300",
        "error": "Student drew the image behind the mirror as a virtual image instead of between C and F."
    },
    {
        "name": "Case_2_At_C",
        "tag": "image_size_wrong",
        "u": "-200",
        "error": "Student drew the image much smaller than the object, but at C it should be the same size."
    },
    {
        "name": "Case_3_Between_C_and_F",
        "tag": "ray_tracing_rule_violation",
        "u": "-150",
        "error": "Student did not pass the parallel ray through the focus."
    },
    {
        "name": "Case_4_At_F",
        "tag": "image_position_wrong",
        "u": "-100",
        "error": "Student drew an image forming exactly at C, but it should be at infinity (parallel rays)."
    },
    {
        "name": "Case_5_Between_P_and_F",
        "tag": "image_nature_wrong",
        "u": "-50",
        "error": "Student drew a real image in front of the mirror, but it should be virtual and behind the mirror."
    }
]

gemini_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}'

def test_gemini(case):
    prompt = get_dynamic_svg_super_prompt(case['tag'], f"Object at u = {case['u']}", case['error'])
    
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192
        }
    }
    
    req = request.Request(
        gemini_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        resp = request.urlopen(req, timeout=30)
        res = json.loads(resp.read().decode('utf-8'))
        content = res["candidates"][0]["content"]["parts"][0]["text"]
        
        # Clean up markdown if any
        if content.startswith("```jsx"):
            content = content[6:]
        elif content.startswith("```javascript"):
            content = content[14:]
        elif content.startswith("```"):
            content = content[3:]
        
        if content.endswith("```"):
            content = content[:-3]
            
        return content.strip()
    except Exception as e:
        print(f"Error for {case['name']}: {e}")
        return None

# Create output directory
output_dir = os.path.join(os.path.dirname(__file__), 'svg_outputs')
os.makedirs(output_dir, exist_ok=True)

print("Starting Zero-Shot SVG Generation Tests...")
for case in test_cases:
    print(f"Generating {case['name']}...")
    result = test_gemini(case)
    if result:
        file_path = os.path.join(output_dir, f"{case['name']}.jsx")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"  -> Saved to {file_path}")
print("Done!")
