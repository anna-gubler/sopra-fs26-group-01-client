import { ApiService } from "./apiService";
import { Quiz, QuizQuestion, QuizAnswer, AttemptResult } from "@/types/quiz";

// ── Path helpers (update here when backend confirms routes) ────────────────
const quizPath = (skillMapId: number, skillId: number) =>
  `/skillmaps/${skillMapId}/skills/${skillId}/quiz`;
const questionsPath = (quizId: number) => `/quizzes/${quizId}/quizQuestions`;
const questionPath = (questionId: number) => `/quizQuestions/${questionId}`;
const answersPath = (questionId: number) => `/quizQuestions/${questionId}/answers`;
const answerPath = (answerId: number) => `/answers/${answerId}`;
const attemptsPath = (quizId: number) => `/quizzes/${quizId}/attempts`;
const latestAttemptPath = (quizId: number) => `/quizzes/${quizId}/attempts/me/latest`;

// ── Quiz CRUD (lecturer) ───────────────────────────────────────────────────

export function createQuiz(api: ApiService, skillMapId: number, skillId: number): Promise<Quiz> {
  return api.post<Quiz>(quizPath(skillMapId, skillId), {});
}

export function deleteQuiz(api: ApiService, skillMapId: number, skillId: number): Promise<void> {
  return api.delete<void>(quizPath(skillMapId, skillId));
}

// ── Questions (lecturer) ───────────────────────────────────────────────────

export function getQuizQuestions(api: ApiService, quizId: number): Promise<QuizQuestion[]> {
  return api.get<QuizQuestion[]>(questionsPath(quizId));
}

export function createQuizQuestion(
  api: ApiService,
  quizId: number,
  data: { quizQuestionText: string; orderIndex: number },
): Promise<QuizQuestion> {
  return api.post<QuizQuestion>(questionsPath(quizId), data);
}

export function updateQuizQuestion(
  api: ApiService,
  questionId: number,
  data: { quizQuestionText?: string; orderIndex?: number },
): Promise<QuizQuestion> {
  return api.patch<QuizQuestion>(questionPath(questionId), data);
}

export function deleteQuizQuestion(api: ApiService, questionId: number): Promise<void> {
  return api.delete<void>(questionPath(questionId));
}

// ── Answers (lecturer) ─────────────────────────────────────────────────────

export function createQuizAnswer(
  api: ApiService,
  questionId: number,
  data: { answerText: string; isCorrect: boolean },
): Promise<QuizAnswer> {
  return api.post<QuizAnswer>(answersPath(questionId), data);
}

export function updateQuizAnswer(
  api: ApiService,
  answerId: number,
  data: { answerText?: string; isCorrect?: boolean },
): Promise<QuizAnswer> {
  return api.patch<QuizAnswer>(answerPath(answerId), data);
}

export function deleteQuizAnswer(api: ApiService, answerId: number): Promise<void> {
  return api.delete<void>(answerPath(answerId));
}

// ── Attempts (student) ─────────────────────────────────────────────────────

export function getLatestAttempt(
  api: ApiService,
  quizId: number,
): Promise<AttemptResult | null> {
  return api.get<AttemptResult | null>(latestAttemptPath(quizId));
}

export function submitAttempt(
  api: ApiService,
  quizId: number,
  data: { answers: { quizQuestionId: number; selectedAnswerId: number }[] },
): Promise<AttemptResult> {
  return api.post<AttemptResult>(attemptsPath(quizId), data);
}
