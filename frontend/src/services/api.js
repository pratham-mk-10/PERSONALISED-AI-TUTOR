const BASE_URL = "http://localhost:8000";

export const getQuestions = async ({ askedQuestionIds = [], limit = 5, topic = null, studentId = null } = {}) => {
  const res = await fetch(`${BASE_URL}/get-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      asked_question_ids: askedQuestionIds,
      limit,
      topic,
      student_id: studentId,
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load questions (${res.status}): ${text}`);
  }

  return res.json();
};

export const getGeneratedQuestions = async ({
  topic = null,
  difficulty = "easy",
  syllabusScope = null,
  questionCount = null,
  tutorContext = null,
} = {}) => {
  const payload = {
    topic,
    difficulty,
    syllabus_scope: syllabusScope,
    tutor_context: tutorContext,
  };

  if (Number.isFinite(questionCount)) {
    payload.question_count = questionCount;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let res;
  try {
    res = await fetch(`${BASE_URL}/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Question generation is taking too long. Please retry.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load generated questions (${res.status}): ${text}`);
  }

  return res.json();
};

export const submitAnswers = async ({ answers, topic = null, studentId = null }) => {
  const res = await fetch(`${BASE_URL}/submit-answers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers, topic, student_id: studentId })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to submit answers (${res.status}): ${text}`);
  }

  return res.json();
};


export const getMisconceptionReason = async (misconceptionTag, topic = "reflection_refraction") => {
  if (!misconceptionTag || misconceptionTag === "none") {
    return {
      reason: "Great work. Keep practicing to strengthen your understanding.",
      focus_area: "N/A"
    };
  }

  const res = await fetch(`${BASE_URL}/misconception-reason`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      misconception_tag: misconceptionTag,
      topic
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get concept feedback (${res.status}): ${text}`);
  }

  return res.json();
};