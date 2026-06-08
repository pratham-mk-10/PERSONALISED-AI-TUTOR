import sys
sys.path.append('c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend')
import importlib.util
spec = importlib.util.spec_from_file_location('pb', 'c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend/content-agent/prompt_builder.py')
pb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pb)

import os
import json
import urllib.request as request
from dotenv import load_dotenv

load_dotenv(dotenv_path='c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend/.env')
mistral_key = os.getenv('MISTRAL_API_KEY', '').strip()

prompt = pb.build_explanation_prompt('spherical_mirrors', 'center_of_curvature_confusion', 2)

system_instruction = 'You are a clear NCERT physics teacher for a Class 10 student. Return a direct teaching explanation only.'

mistral_url = 'https://api.mistral.ai/v1/chat/completions'
mistral_payload = {
    'model': 'mistral-small-latest',
    'messages': [
        {'role': 'system', 'content': system_instruction},
        {'role': 'user', 'content': prompt}
    ],
    'temperature': 0.4,
    'max_tokens': 800
}
m_req = request.Request(
    mistral_url, 
    data=json.dumps(mistral_payload).encode('utf-8'), 
    headers={'Authorization': f'Bearer {mistral_key}', 'Content-Type': 'application/json'}, 
    method='POST'
)
m_resp = request.urlopen(m_req, timeout=15)
m_res = json.loads(m_resp.read().decode('utf-8'))
print("MISTRAL OUTPUT:")
print(m_res['choices'][0]['message']['content'])
