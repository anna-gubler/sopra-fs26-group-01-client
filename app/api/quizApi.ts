import { ApiService } from "./apiService";
import { Quiz, QuizQuestion, QuizAnswer, QuizAttempt } from "@/types/quiz";

// ── Path helpers ─────────────────────────────────────────────────────────────
const quizPath = (skillId: number) => `/skills/${skillId}/quiz`;
const quizByIdPath = (quizId: number) => `/quizzes/${quizId}`;
const questionsPath = (quizId: number) => `/quizzes/${quizId}/quizQuestions`;
const questionPath = (questionId: number) => `/quizQuestions/${questionId}`;
const answersPath = (questionId: number) => `/quizQuestions/${questionId}/answers`;
const answerPath = (answerId: number) => `/answers/${answerId}`;
const attemptsPath = (quizId: number) => `/quizzes/${quizId}/attempts`;
const latestAttemptPath = (quizId: number) => `/quizzes/${quizId}/attempts/me/latest`;
const attemptPath = (attemptId: number) => `/attempts/${attemptId}`;
const submitAttemptPath = (attemptId: number) => `/attempts/${attemptId}/submit`;

// ── Quiz CRUD (owner) ─────────────────────────────────────────────────────────

export function getQuiz(api: ApiService, skillId: number): Promise<Quiz> {
  return api.get<Quiz>(quizPath(skillId));
}

export function createQuiz(
  api: ApiService,
  skillId: number,
  data?: { isActive?: boolean; cooldownHours?: number; passMark?: number },
): Promise<Quiz> {
  return api.post<Quiz>(quizPath(skillId), data ?? {});
}

export function updateQuiz(
  api: ApiService,
  quizId: number,
  data: { isActive?: boolean; cooldownHours?: number; passMark?: number },
): Promise<Quiz> {
  return api.patch<Quiz>(quizByIdPath(quizId), data);
}

export function deleteQuiz(api: ApiService, quizId: number): Promise<void> {
  return api.delete<void>(quizByIdPath(quizId));
}

// ── Questions (owner write, member read) ──────────────────────────────────────

export async function getQuizQuestions(api: ApiService, quizId: number): Promise<QuizQuestion[]> {
  const questions = await api.get<Omit<QuizQuestion, "answers">[]>(questionsPath(quizId));
  return Promise.all(
    questions.map(async (q) => ({
      ...q,
      answers: await api.get<QuizAnswer[]>(answersPath(q.id)),
    })),
  );
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

// ── Answers (owner write, member read) ───────────────────────────────────────

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

// ── Attempts (member) ─────────────────────────────────────────────────────────

// Step 1 of two-step submit: creates an unsubmitted attempt (passed === null)
export function createAttempt(api: ApiService, quizId: number): Promise<QuizAttempt> {
  return api.post<QuizAttempt>(attemptsPath(quizId), {});
}

// Step 2 of two-step submit: send answers to the attempt created above
export function submitAttempt(
  api: ApiService,
  attemptId: number,
  data: { answers: { quizQuestionId: number; selectedAnswerId: number }[] },
): Promise<QuizAttempt> {
  return api.post<QuizAttempt>(submitAttemptPath(attemptId), data);
}

export async function getLatestAttempt(
  api: ApiService,
  quizId: number,
): Promise<QuizAttempt | null> {
  try {
    return await api.get<QuizAttempt>(latestAttemptPath(quizId));
  } catch (e) {
    if (typeof e === "object" && e !== null && (e as { status?: number }).status === 404) {
      return null;
    }
    throw e;
  }
}

export function getAttempt(api: ApiService, attemptId: number): Promise<QuizAttempt> {
  return api.get<QuizAttempt>(attemptPath(attemptId));
}
