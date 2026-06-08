import sys
sys.path.append('c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend')
import importlib.util

spec = importlib.util.spec_from_file_location('pb', 'c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend/content-agent/prompt_builder.py')
pb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pb)

spec2 = importlib.util.spec_from_file_location('ls', 'c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend/content-agent/llm_service.py')
ls = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(ls)

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='c:/Pratham/Pesu/Sem 6/Antigravity Uncooked Part/PERSONALISED-AI-TUTOR/backend/.env')
key = os.getenv('GEMINI_API_KEY', '').strip()

prompt = pb.build_explanation_prompt('spherical_mirrors', 'center_of_curvature_confusion', 2)
sys_inst = 'You are an NCERT Class 10 physics teacher.'

print(ls._post_chat_completion(key, sys_inst, prompt))
