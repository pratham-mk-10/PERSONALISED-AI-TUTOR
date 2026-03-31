const BASE_URL = "http://localhost:8000";

export const getQuestions = async () => {
  const res = await fetch(`${BASE_URL}/get-questions`, {
    method: "POST"
  });
  return res.json();
};

export const submitAnswers = async (answers) => {
  const res = await fetch(`${BASE_URL}/submit-answers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers })
  });

  return res.json();
};