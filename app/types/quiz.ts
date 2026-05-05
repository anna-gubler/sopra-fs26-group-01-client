export interface Quiz {
  id: number;
  skillId: number;
}

export interface QuizAnswer {
  id: number;
  quizQuestionId: number;
  answerText: string;
  isCorrect?: boolean; // only present for lecturer; hidden pre-submission for students
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  quizQuestionText: string;
  orderIndex: number;
  answers: QuizAnswer[];
}

export interface AttemptAnswer {
  quizQuestionId: number;
  selectedAnswerId: number;
  isCorrect: boolean;
}

export interface AttemptResult {
  id: number;
  score: number;
  answers: AttemptAnswer[];
}

export interface DashboardQuizSummary {
  quizId: number;
  skillId: number;
  totalAttempts: number;
  averageScore: number;
}
