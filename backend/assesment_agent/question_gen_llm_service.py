import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("MISTRAL_API_KEY")

API_URL = "https://api.mistral.ai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def generate_text(prompt):
    data = {
        "model": "mistral-large-latest",  # 🔥 BEST available from Mistral API
        "messages": [
            {"role": "system", "content": "You are a physics teacher."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 800
    }

    response = requests.post(API_URL, headers=headers, json=data)

    result = response.json()

    return result["choices"][0]["message"]["content"]