export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

export const getStudentMemory = async (studentId) => {
  if (!studentId) return { has_memory: false };

  try {
    const res = await fetch(`${BASE_URL}/student/${encodeURIComponent(studentId)}/memory`);
    if (!res.ok) return { has_memory: false };
    return res.json();
  } catch {
    return { has_memory: false };
  }
};

export const submitAnswers = async ({ answers, topic = null, studentId = null, attemptNumber = 1 }) => {
  const res = await fetch(`${BASE_URL}/submit-answers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers, topic, student_id: studentId, attempt_number: attemptNumber })
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
  // Optional { [tag]: tripCount } map. When present, the backend splits
  // questionCount proportionally across tags instead of treating them
  // all equally — used for the weighted cross-session retest quiz.
  misconceptionWeights = null,
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

  if (misconceptionWeights && typeof misconceptionWeights === "object" && Object.keys(misconceptionWeights).length > 0) {
    payload.misconception_weights = misconceptionWeights;
  }

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


export const getMisconceptionReason = async (misconceptionTag, topic = "reflection_refraction", questionText = null, studentAnswer = null, correctAnswer = null) => {
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
      topic,
      question_text: questionText,
      student_answer: studentAnswer,
      correct_answer: correctAnswer
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get concept feedback (${res.status}): ${text}`);
  }

  return res.json();
};

export const submitNumericAnswerLog = async ({
  studentId,
  topic = "Mirror Formula and Magnification",
  misconceptionTag = null,
  attemptNumber = 1,
  questionText = null,
  studentAnswer = null,
  correctAnswer = null,
} = {}) => {
  const res = await fetch(`${BASE_URL}/submit-numeric-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      student_id: studentId,
      topic,
      misconception_tag: misconceptionTag,
      attempt_number: attemptNumber,
      question_text: questionText,
      student_answer: studentAnswer,
      correct_answer: correctAnswer,
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to log numeric answer (${res.status}): ${text}`);
  }

  return res.json();
};

export const getDescriptiveQuestions = async (topic = null) => {
  const url = topic ? `${BASE_URL}/descriptive-questions/${encodeURIComponent(topic)}` : `${BASE_URL}/descriptive-questions/all`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load descriptive questions (${res.status}): ${text}`);
  }
  return res.json();
};

export const evalDescriptiveAnswer = async ({ studentId, questionId, studentAnswer }) => {
  const res = await fetch(`${BASE_URL}/eval/descriptive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      student_id: studentId,
      question_id: questionId,
      student_answer: studentAnswer
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evaluation failed (${res.status}): ${text}`);
  }
  return res.json();
};