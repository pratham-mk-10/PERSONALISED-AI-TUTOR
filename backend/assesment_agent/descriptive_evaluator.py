import json
import os
import re
import sys
import urllib.request
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

# Add backend and repo root to path to ensure robust imports
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))
if str(BACKEND_ROOT.parent) not in sys.path:
    sys.path.append(str(BACKEND_ROOT.parent))

try:
    from database.models import log_flagged_evaluation
except ImportError:
    try:
        from backend.database.models import log_flagged_evaluation
    except ImportError:
        def log_flagged_evaluation(*args, **kwargs):
            print("Fallback: log_flagged_evaluation not imported.")

def _get_api_key():
    from dotenv import load_dotenv
    _ENV_CANDIDATES = [
        BACKEND_ROOT / ".env",
        BACKEND_ROOT / "env",
        BACKEND_ROOT.parent / ".env",
    ]
    for env_path in _ENV_CANDIDATES:
        if env_path.exists():
            load_dotenv(dotenv_path=env_path, override=False)
            
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
    return api_key

# 1. Pydantic Schemas for Validation
class EvaluationScores(BaseModel):
    understanding: int = Field(ge=0, le=10, description="Score for conceptual understanding, physical correctness, and semantic intent (0-10). Heaviest weight.")
    completeness: int = Field(ge=0, le=10, description="Score for addressing all required parts of the question rubric (0-10). Secondary weight.")
    keywords: int = Field(ge=0, le=10, description="Score for scientific terminology/keyword usage (0-10). Minimal weight.")

class DescriptiveEvaluation(BaseModel):
    reasoning_trace: List[str] = Field(description="Step-by-step Chain-of-Thought reasoning tracing the semantic evaluation process.")
    contradicted_span: Optional[str] = Field(None, description="Exact phrase from student answer violating physical laws, or null.")
    misconception_tag: Optional[str] = Field(None, description="Tag for the main misconception detected. Use NOVEL_UNTAGGED_ERROR if incorrect but no specific tag fits. Use null if correct.")
    scores: EvaluationScores
    feedback: str = Field(description="Encouraging and constructive text correcting errors or praising correct understanding.")

class DescriptiveEvaluator:
    def __init__(self):
        self.api_key = _get_api_key()
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"

    def run_smart_gate(self, student_answer: str, required_keywords: List[str]) -> tuple[bool, str | None]:
        """Stage 1: Smart Gate.
        Checks length (>= 4 words) and keyword overlap using set.intersection.
        """
        cleaned_ans = student_answer.strip()
        
        words = re.findall(r"\b\w+\b", cleaned_ans.lower())
        if len(words) < 4:
            return False, "Your answer is too short (must be at least 4 words). Please write a complete explanation."

        if required_keywords:
            student_word_set = set(words)
            keyword_set = {str(k).strip().lower() for k in required_keywords if str(k).strip()}
            
            if not student_word_set.intersection(keyword_set):
                return False, f"Your answer does not contain the key concepts required (e.g. {', '.join(required_keywords[:3])}). Please focus on the physics elements of the question."

        return True, None

    def _call_llm(self, system_instruction: str, prompt: str) -> str:
        """Call Gemini 3.5 Flash directly with temperature=0 and JSON output mode."""
        url = f"{self.api_url}?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json"
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
        
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return res["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            mistral_key = os.getenv("MISTRAL_API_KEY", "").strip()
            if mistral_key:
                mistral_url = "https://api.mistral.ai/v1/chat/completions"
                mistral_payload = {
                    "model": "mistral-small-latest",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.0,
                    "response_format": {"type": "json_object"}
                }
                m_req = urllib.request.Request(
                    mistral_url,
                    data=json.dumps(mistral_payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {mistral_key}",
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                try:
                    with urllib.request.urlopen(m_req, timeout=20) as m_resp:
                        m_res = json.loads(m_resp.read().decode("utf-8"))
                        return m_res["choices"][0]["message"]["content"]
                except Exception:
                    pass
            raise e

    def evaluate_answer(
        self,
        student_id: str,
        question_id: int,
        question: str,
        student_answer: str,
        rubric_items: List[str],
        known_misconceptions: List[str],
        required_keywords: List[str]
    ) -> dict:
        # --- STAGE 1: SMART GATE ---
        passed_gate, gate_error = self.run_smart_gate(student_answer, required_keywords)
        if not passed_gate:
            return {
                "reasoning_trace": ["Stage 1 Smart Gate check failed."],
                "contradicted_span": None,
                "misconception_tag": "UNKNOWN_MISCONCEPTION",
                "scores": {
                    "understanding": 0,
                    "completeness": 0,
                    "keywords": 0
                },
                "feedback": gate_error
            }

        # --- STAGE 2: UNIFIED CoT LLM ENGINE ---
        system_instruction = """You are an expert Class 10 Physics examiner grading a student's descriptive answer using Chain-of-Thought (CoT) reasoning.

CRITICAL OBJECTIVES & GRADING DIRECTIVES:
1. SOLVE THE LEXICAL GAP PROBLEM: You MUST evaluate conceptual understanding and physical semantic intent. Do NOT penalize students for missing textbook jargon or using informal words (e.g. if they write "curves inwards and light smashes together" instead of "concave mirror converging rays", grade their understanding as 10/10).
2. SOLVE THE NEGATION PROBLEM: Pay strict attention to polar terms ("always", "never", "equal", "opposite"). Verify physical entailment rather than vector proximity to catch polar opposite statements.
3. SCORING WEIGHT DISTRIBUTION:
   - "understanding": Conceptual accuracy & correctness (HEAVIEST WEIGHT, 70%).
   - "completeness": Coverage of required rubric points (SECONDARY WEIGHT, 25%).
   - "keywords": Scientific terminology usage (MINIMAL WEIGHT, 5%).

Output your evaluation strictly as a single JSON object conforming to this schema:
{
  "reasoning_trace": [
    "Step 1: Analyze semantic intent and check for lexical gap equivalence.",
    "Step 2: Verify negation and physical entailment accuracy.",
    "Step 3: Check rubric completeness and identify misconception tags."
  ],
  "contradicted_span": "Exact text containing physical error, or null if correct.",
  "misconception_tag": "Specific tag from allowed list, or 'NOVEL_UNTAGGED_ERROR' if incorrect without matching tag, or null if correct.",
  "scores": {
    "understanding": 0-10,
    "completeness": 0-10,
    "keywords": 0-10
  },
  "feedback": "Encouraging pedagogical explanation focusing on physics understanding."
}"""

        few_shot_anchors = """
### Few-Shot Anchors:

Anchor Example 1 (Exemplary Understanding - High Score):
- Question: Why does a concave mirror form a real image but a convex mirror forms a virtual one?
- Rubric:
  * Concave mirrors physically converge light rays to a point.
  * Real images form where rays intersect.
  * Convex mirrors diverge light.
  * Virtual images form where rays appear to meet behind mirror.
- Student Answer: "A concave mirror caves inwards and makes light rays smash together at a point in front. Since the rays actually cross, it creates a real image. A convex mirror curves outwards and spreads light apart, so they only look like they meet inside the mirror."
- Expected Output JSON:
{
  "reasoning_trace": [
    "Step 1: Analyzed student semantic intent. Resolving lexical gap: 'caves inwards and smashes together' equals convergence; 'spreads light apart' equals divergence.",
    "Step 2: Verified physical entailment. Correctly links actual ray crossing to real image, and virtual intersection behind mirror to virtual image.",
    "Step 3: Checked for misconceptions. Found none."
  ],
  "contradicted_span": null,
  "misconception_tag": null,
  "scores": {
    "understanding": 10,
    "completeness": 10,
    "keywords": 8
  },
  "feedback": "Outstanding understanding! You clearly explained why light converges to form a real image in concave mirrors and diverges in convex mirrors to produce virtual images."
}

Anchor Example 2 (Partially Correct - Mid Score):
- Question: Why does a concave mirror form a real image but a convex mirror forms a virtual one?
- Rubric (same as above)
- Student Answer: "Concave mirrors cave in so the light rays reflect and meet at the center of curvature. Convex mirrors reflect light outwards so they form virtual images behind the mirror."
- Expected Output JSON:
{
  "reasoning_trace": [
    "Step 1: Student understands concave reflects inwards and convex reflects outwards.",
    "Step 2: Checked physics accuracy. Student states rays meet at center of curvature instead of focus.",
    "Step 3: Tagged center_of_curvature_confusion misconception."
  ],
  "contradicted_span": "meet at the center of curvature",
  "misconception_tag": "center_of_curvature_confusion",
  "scores": {
    "understanding": 6,
    "completeness": 6,
    "keywords": 5
  },
  "feedback": "Good attempt! You understand that concave mirrors reflect light inwards, but parallel rays meet at the Principal Focus (F) rather than the Center of Curvature (C)."
}

Anchor Example 3 (Incorrect / Negation Violation - Low Score):
- Question: Why does a concave mirror form a real image but a convex mirror forms a virtual one?
- Rubric (same as above)
- Student Answer: "Convex mirrors reflect light inwards and always form real images because the shiny part is on the inside, while concave mirrors form virtual images because they diverge the light."
- Expected Output JSON:
{
  "reasoning_trace": [
    "Step 1: Analyzed student answer. Student completely inverted mirror behaviors.",
    "Step 2: Solved negation/polar error: Convex mirrors do not reflect inwards or form real images.",
    "Step 3: Found concave_convex_confusion misconception."
  ],
  "contradicted_span": "Convex mirrors reflect light inwards and always form real images",
  "misconception_tag": "concave_convex_confusion",
  "scores": {
    "understanding": 1,
    "completeness": 2,
    "keywords": 2
  },
  "feedback": "It looks like you mixed up the two mirrors! A concave mirror curves inwards and converges light, whereas a convex mirror curves outwards and diverges light."
}
"""

        prompt = f"""
Question: {question}

Rubric Requirements:
{json.dumps(rubric_items, indent=2)}

Allowed Misconception Tags:
{json.dumps(known_misconceptions, indent=2)}

Student Answer:
"{student_answer}"

{few_shot_anchors}

Evaluate the student answer following the Chain of Thought grading process and output JSON strictly conforming to the schema.
"""

        raw_response = ""
        last_error = ""

        # --- STAGE 3: RELIABILITY LAYER ---
        for attempt in range(2):
            try:
                raw_response = self._call_llm(system_instruction, prompt)
                
                cleaned = raw_response.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                elif cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

                parsed_dict = json.loads(cleaned)
                
                val = DescriptiveEvaluation(**parsed_dict)
                return val.model_dump()
            except Exception as e:
                last_error = str(e)

        try:
            log_flagged_evaluation(
                student_id=student_id,
                question_id=question_id,
                student_answer=student_answer,
                raw_response=raw_response or None,
                error_message=last_error
            )
        except Exception as db_err:
            print(f"Failed to log flagged evaluation to DB: {db_err}")

        return {
            "reasoning_trace": ["Reliability layer double failure fallback.", last_error],
            "contradicted_span": None,
            "misconception_tag": "NOVEL_UNTAGGED_ERROR",
            "scores": {
                "understanding": 0,
                "completeness": 0,
                "keywords": 0
            },
            "feedback": "We had trouble evaluating this answer. It has been securely forwarded to your instructor for manual grading."
        }
