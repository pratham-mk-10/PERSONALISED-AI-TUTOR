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

  const res = await fetch(`${BASE_URL}/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

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