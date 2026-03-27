import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const startSession = (topic) =>
  API.post("/session/start", { topic });

export const submitQuiz = (data) =>
  API.post("/quiz/submit", data);

export const getContent = (data) =>
  API.post("/content/get", data);

export const adaptDecision = (data) =>
  API.post("/adapt/decide", data);

export const getFeedback = (tag) =>
  API.get(`/feedback/visual?tag=${tag}`);

export const generateTopicContent = (payload) =>
  API.post("/content/topic", payload);

export const generateTopicQuiz = (payload) =>
  API.post("/quiz/topic", payload);

export const evaluateTopicAssignment = (payload) =>
  API.post("/evaluation/topic", payload);

export default API;