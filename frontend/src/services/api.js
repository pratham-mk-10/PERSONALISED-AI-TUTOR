const BASE_URL = "http://localhost:8000";

export const getContent = async ({ subtopic, misconception_tag, attempt }) => {
  const response = await fetch(`${BASE_URL}/get-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subtopic, misconception_tag, attempt }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Backend error (${response.status}): ${text}`);
  }

  return response.json();
};

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
  questionCount = 5,
  tutorContext = null,
} = {}) => {
  const res = await fetch(`${BASE_URL}/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic,
      difficulty,
      syllabus_scope: syllabusScope,
      question_count: questionCount,
      tutor_context: tutorContext,
    })
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
