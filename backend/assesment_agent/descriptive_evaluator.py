import json
import os
import sys
from pathlib import Path

# Add backend to path to import llm_service
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

# We import the existing llm service you already have so we don't break anything!
from content_agent.llm_service import _post_chat_completion, _get_api_key

class DescriptiveEvaluator:
    def __init__(self):
        self.api_key = _get_api_key()

    def evaluate_answer(self, question, student_answer, rubric_items, known_misconceptions):
        system_instruction = """You are an expert Class 10 Physics examiner grading a student's descriptive answer.
You MUST prioritize conceptual understanding (semantic meaning) over exact keyword matching.
You will evaluate the answer across 4 dimensions:
1. Conceptual Entailment (Does the semantic meaning match the physics reality?)
2. Contradiction Detection (Are there explicit physics violations or fundamental misunderstandings?)
3. Completeness (Did they address all parts of the rubric?)
4. Terminology (Did they use correct scientific terms like 'converge', 'pole', 'real image'?)

Output your evaluation strictly as a JSON object with the following structure. Do not output any markdown code blocks, just raw JSON.
{
  "reasoning_trace": [
    "Step 1: Analyze what the student literally meant, ignoring missing vocabulary.",
    "Step 2: Cross-reference their semantic meaning with the required rubric items.",
    "Step 3: Check for explicit contradictions or physics violations."
  ],
  "parameter_scores": {
    "conceptual": 0-10,
    "completeness": 0-10,
    "terminology": 0-10
  },
  "final_score": 0-10,
  "misconception_tag": "TAG_NAME" or null,
  "constructive_feedback": "Your text here. If they had great concepts but bad vocabulary, praise the concept and gently correct the vocabulary."
}"""

        prompt = f"""
Question: {question}

Rubric Requirements:
{json.dumps(rubric_items, indent=2)}

Common Misconceptions to look out for:
{json.dumps(known_misconceptions, indent=2)}

Student Answer:
"{student_answer}"

Execute the Chain of Thought grading process and output the JSON.
"""
        response_text = _post_chat_completion(self.api_key, system_instruction, prompt)
        
        # Clean potential markdown formatting just in case the LLM disobeys the raw JSON rule
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            print("Failed to decode JSON from LLM:")
            print(response_text)
            return None

# Quick local test to prove it works
if __name__ == "__main__":
    evaluator = DescriptiveEvaluator()
    
    q = "Why does a concave mirror form a real image but a convex mirror forms a virtual one?"
    rubric = [
        "Concave mirrors physically converge light rays to a point in front of the mirror.",
        "Real images are formed when rays actually intersect.",
        "Convex mirrors diverge light rays.",
        "Virtual images are formed when rays only appear to intersect behind the mirror."
    ]
    misconceptions = ["CONVEX_REAL_IMAGE", "CONCAVE_ALWAYS_REAL", "RAYS_DONT_EXIST"]
    
    # Notice this student answer has ZERO of the official keywords (converge, diverge, real, virtual)
    # but the CONCEPTUAL physics is 100% correct.
    ans = "Because convex mirrors have the shiny part on the outside, so the light bounces outwards and never actually touches. They just look like they meet inside the mirror. But concave caves in, so the light smashes together in the real world."
    
    print("Evaluating student answer...")
    result = evaluator.evaluate_answer(q, ans, rubric, misconceptions)
    print(json.dumps(result, indent=2))
