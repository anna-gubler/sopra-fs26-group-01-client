export interface Quiz {
  id: number;
  skillId: number;
  isActive: boolean;
  cooldownHours: number;
  passMark: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  id: number;
  quizQuestionId: number;
  answerText: string;
  isCorrect: boolean;
}

// answers are fetched separately from /quizQuestions/{id}/answers and merged client-side
export interface QuizQuestion {
  id: number;
  quizId: number;
  quizQuestionText: string;
  orderIndex: number;
  answers: QuizAnswer[];
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  score: number | null;
  passed: boolean | null;
  attemptedAt: string;
  cooldownUntil: string | null;
  updatedAt: string;
}

export interface DashboardQuizSummary {
  quizId: number;
  skillId: number;
  totalAttempts: number;
  averageScore: number;
}
