import { generateUUID } from "@/utils/uuid";

// contains everything needed for the quiz that doesn't need React component context

export type LocalAnswer = {
  key: string;
  id?: number;
  answerText: string;
  isCorrect: boolean;
};

export type LocalQuestion = {
  key: string;
  id?: number;
  quizQuestionText: string;
  answers: LocalAnswer[];
};

export function emptyAnswer(): LocalAnswer {
  return { key: generateUUID(), answerText: "", isCorrect: false };
}

export function emptyQuestion(): LocalQuestion {
  return { key: generateUUID(), quizQuestionText: "", answers: [emptyAnswer()] };
}

export function validate(questions: LocalQuestion[]): string | null {
  if (questions.length === 0) return "Add at least one question.";
  for (const q of questions) {
    if (!q.quizQuestionText.trim()) return "All questions must have text.";
    if (q.answers.length === 0) return "Each question must have at least one answer.";
    for (const a of q.answers) {
      if (!a.answerText.trim()) return "All answers must have text.";
    }
    if (!q.answers.some((a) => a.isCorrect))
      return "Each question must have one correct answer marked.";
  }
  return null;
}

export function updateQuestionText(qs: LocalQuestion[], key: string, text: string): LocalQuestion[] {
  return qs.map((q) => (q.key === key ? { ...q, quizQuestionText: text } : q));
}

export function removeQuestion(qs: LocalQuestion[], key: string): LocalQuestion[] {
  return qs.filter((q) => q.key !== key);
}

export function addQuestion(qs: LocalQuestion[]): LocalQuestion[] {
  return [...qs, emptyQuestion()];
}

export function updateAnswerText(
  qs: LocalQuestion[],
  qKey: string,
  aKey: string,
  text: string,
): LocalQuestion[] {
  return qs.map((q) =>
    q.key !== qKey
      ? q
      : { ...q, answers: q.answers.map((a) => (a.key === aKey ? { ...a, answerText: text } : a)) },
  );
}

export function setCorrectAnswer(qs: LocalQuestion[], qKey: string, aKey: string): LocalQuestion[] {
  return qs.map((q) =>
    q.key !== qKey
      ? q
      : { ...q, answers: q.answers.map((a) => ({ ...a, isCorrect: a.key === aKey })) },
  );
}

export function removeAnswer(qs: LocalQuestion[], qKey: string, aKey: string): LocalQuestion[] {
  return qs.map((q) =>
    q.key !== qKey ? q : { ...q, answers: q.answers.filter((a) => a.key !== aKey) },
  );
}

export function addAnswer(qs: LocalQuestion[], qKey: string): LocalQuestion[] {
  return qs.map((q) => (q.key === qKey ? { ...q, answers: [...q.answers, emptyAnswer()] } : q));
}

// Returns a human-readable label like "2h 15m" if cooldown is still active, null if it has expired.
export function formatCooldownLabel(cooldownUntil: string): string | null {
  const until = new Date(cooldownUntil);
  if (until <= new Date()) return null;
  // convert remaining ms into whole hours plus the leftover minutes
  const diffMs = until.getTime() - Date.now();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
