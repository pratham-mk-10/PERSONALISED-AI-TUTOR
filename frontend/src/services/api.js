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
  videoTemplate = null,
  taughtConcepts = null,
  untaughtConcepts = null,
  lessonContent = null,
} = {}) => {
  const payload = {
    topic,
    difficulty,
    syllabus_scope: syllabusScope,
    tutor_context: tutorContext,
    video_template: videoTemplate,
    taught_concepts: taughtConcepts,
    untaught_concepts: untaughtConcepts,
    lesson_content: lessonContent,
  };

  if (Number.isFinite(questionCount)) {
    payload.question_count = questionCount;
  }

  const controller = new AbortController();
  // LLM question generation can occasionally exceed 60s under heavy load.
  const timeoutId = setTimeout(() => controller.abort(), 120000);

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


export const getMisconceptionQuiz = async ({
  topic = null,
  studentId = null,
  misconceptionTags = [],
  wrongQuestionTexts = [],
  questionCount = 5,
  difficulty = "easy",
} = {}) => {
  const payload = {
    topic,
    student_id: studentId,
    misconception_tags: Array.isArray(misconceptionTags) ? misconceptionTags : [],
    wrong_question_texts: Array.isArray(wrongQuestionTexts) ? wrongQuestionTexts : [],
    difficulty,
  };

  if (Number.isFinite(questionCount)) {
    payload.question_count = questionCount;
  }

  const res = await fetch(`${BASE_URL}/generate-misconception-quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load misconception quiz (${res.status}): ${text}`);
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

export const getDescriptiveQuestions = async (topic) => {
  const res = await fetch(`${BASE_URL}/descriptive-questions/${topic}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch descriptive questions (${res.status}): ${text}`);
  }
  return res.json();
};

export const evaluateDescriptiveAnswer = async ({ studentId, questionId, studentAnswer }) => {
  const res = await fetch(`${BASE_URL}/eval/descriptive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_id: studentId,
      question_id: questionId,
      student_answer: studentAnswer,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to evaluate descriptive answer (${res.status}): ${text}`);
  }
  return res.json();
};