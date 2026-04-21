import { ApiService } from "./apiService";
import { CollaborationSession } from "@/types/session";
import { Question } from "@/types/question";

export function getActiveSession(api: ApiService, skillMapId: number): Promise<CollaborationSession> {
  return api.get<CollaborationSession>(`/skillmaps/${skillMapId}/sessions/active`);
}

export function startSession(api: ApiService, skillMapId: number): Promise<CollaborationSession> {
  return api.post<CollaborationSession>(`/skillmaps/${skillMapId}/sessions`, {});
}

export function endSession(api: ApiService, skillMapId: number): Promise<void> {
  return api.post<void>(`/skillmaps/${skillMapId}/sessions/active/end`, {});
}

export type SpeedFeedback = "TOO_SLOW" | "OK" | "TOO_FAST";

export function submitSpeedFeedback(api: ApiService, sessionId: number, feedback: SpeedFeedback): Promise<void> {
  return api.put<void>(`/sessions/${sessionId}/speed`, { feedback });
}

export function getQuestions(api: ApiService, sessionId: number): Promise<Question[]> {
  return api.get<Question[]>(`/sessions/${sessionId}/questions`);
}

export function postQuestion(api: ApiService, sessionId: number, skillId: number, text: string): Promise<Question> {
  return api.post<Question>(`/sessions/${sessionId}/questions`, { skillId, text });
}

export function upvoteQuestion(api: ApiService, questionId: number): Promise<void> {
  return api.post<void>(`/questions/${questionId}/upvotes`, {});
}

export function removeUpvote(api: ApiService, questionId: number): Promise<void> {
  return api.delete<void>(`/questions/${questionId}/upvotes/me`);
}

export function markQuestionAddressed(api: ApiService, questionId: number): Promise<void> {
  return api.post<void>(`/questions/${questionId}/mark-addressed`, {});
}

export function submitSkillRating(api: ApiService, sessionId: number, skillId: number, rating: number): Promise<void> {
  return api.put<void>(`/sessions/${sessionId}/skills/${skillId}/rating`, { rating });
}
