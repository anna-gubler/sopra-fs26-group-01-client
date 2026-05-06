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

// ── Mock mode (flip to false when backend routes are confirmed) ────────────
const MOCK_MODE = true;

const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    quizId: 1,
    quizQuestionText: "What is React?",
    orderIndex: 0,
    answers: [
      { id: 1, quizQuestionId: 1, answerText: "A JavaScript library for building UIs", isCorrect: true },
      { id: 2, quizQuestionId: 1, answerText: "A CSS framework", isCorrect: false },
      { id: 3, quizQuestionId: 1, answerText: "A backend framework", isCorrect: false },
    ],
  },
  {
    id: 2,
    quizId: 1,
    quizQuestionText: "Which hook manages side effects in React?",
    orderIndex: 1,
    answers: [
      { id: 4, quizQuestionId: 2, answerText: "useState", isCorrect: false },
      { id: 5, quizQuestionId: 2, answerText: "useEffect", isCorrect: true },
      { id: 6, quizQuestionId: 2, answerText: "useRef", isCorrect: false },
    ],
  },
];

function mockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 300));
}

// ── Quiz CRUD (lecturer) ───────────────────────────────────────────────────

export function createQuiz(api: ApiService, skillMapId: number, skillId: number): Promise<Quiz> {
  if (MOCK_MODE) return mockDelay({ id: 1, skillId });
  return api.post<Quiz>(quizPath(skillMapId, skillId), {});
}

export function deleteQuiz(api: ApiService, skillMapId: number, skillId: number): Promise<void> {
  if (MOCK_MODE) return mockDelay(undefined as void);
  return api.delete<void>(quizPath(skillMapId, skillId));
}

// ── Questions (lecturer) ───────────────────────────────────────────────────

export function getQuizQuestions(api: ApiService, quizId: number): Promise<QuizQuestion[]> {
  if (MOCK_MODE) return mockDelay([...MOCK_QUESTIONS]);
  return api.get<QuizQuestion[]>(questionsPath(quizId));
}

export function createQuizQuestion(
  api: ApiService,
  quizId: number,
  data: { quizQuestionText: string; orderIndex: number },
): Promise<QuizQuestion> {
  if (MOCK_MODE) return mockDelay({ id: Date.now(), quizId, ...data, answers: [] });
  return api.post<QuizQuestion>(questionsPath(quizId), data);
}

export function updateQuizQuestion(
  api: ApiService,
  questionId: number,
  data: { quizQuestionText?: string; orderIndex?: number },
): Promise<QuizQuestion> {
  if (MOCK_MODE) {
    const q = MOCK_QUESTIONS.find((q) => q.id === questionId);
    return mockDelay({ ...(q ?? MOCK_QUESTIONS[0]), ...data });
  }
  return api.patch<QuizQuestion>(questionPath(questionId), data);
}

export function deleteQuizQuestion(api: ApiService, questionId: number): Promise<void> {
  if (MOCK_MODE) return mockDelay(undefined as void);
  return api.delete<void>(questionPath(questionId));
}

// ── Answers (lecturer) ─────────────────────────────────────────────────────

export function createQuizAnswer(
  api: ApiService,
  questionId: number,
  data: { answerText: string; isCorrect: boolean },
): Promise<QuizAnswer> {
  if (MOCK_MODE) return mockDelay({ id: Date.now(), quizQuestionId: questionId, ...data });
  return api.post<QuizAnswer>(answersPath(questionId), data);
}

export function updateQuizAnswer(
  api: ApiService,
  answerId: number,
  data: { answerText?: string; isCorrect?: boolean },
): Promise<QuizAnswer> {
  if (MOCK_MODE) return mockDelay({ id: answerId, quizQuestionId: 0, answerText: "", isCorrect: false, ...data });
  return api.patch<QuizAnswer>(answerPath(answerId), data);
}

export function deleteQuizAnswer(api: ApiService, answerId: number): Promise<void> {
  if (MOCK_MODE) return mockDelay(undefined as void);
  return api.delete<void>(answerPath(answerId));
}

// ── Attempts (student) ─────────────────────────────────────────────────────

export function getLatestAttempt(
  api: ApiService,
  quizId: number,
): Promise<AttemptResult | null> {
  if (MOCK_MODE) return mockDelay(null); // null = student hasn't taken it yet
  return api.get<AttemptResult | null>(latestAttemptPath(quizId));
}

export function submitAttempt(
  api: ApiService,
  quizId: number,
  data: { answers: { quizQuestionId: number; selectedAnswerId: number }[] },
): Promise<AttemptResult> {
  if (MOCK_MODE) {
    const gradedAnswers = data.answers.map(({ quizQuestionId, selectedAnswerId }) => {
      const question = MOCK_QUESTIONS.find((q) => q.id === quizQuestionId);
      const answer = question?.answers.find((a) => a.id === selectedAnswerId);
      return { quizQuestionId, selectedAnswerId, isCorrect: answer?.isCorrect ?? false };
    });
    const score = gradedAnswers.filter((a) => a.isCorrect).length;
    return mockDelay({ id: Date.now(), score, answers: gradedAnswers });
  }
  return api.post<AttemptResult>(attemptsPath(quizId), data);
}
