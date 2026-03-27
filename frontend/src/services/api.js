import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Start session
export const startSession = (topic) =>
  API.post("/session/start", { topic });

// Submit quiz
export const submitQuiz = (data) =>
  API.post("/quiz/submit", data);

// Get content
export const getContent = (data) =>
  API.post("/content/get", data);

// Adapt decision
export const adaptDecision = (data) =>
  API.post("/adapt/decide", data);

export default API;