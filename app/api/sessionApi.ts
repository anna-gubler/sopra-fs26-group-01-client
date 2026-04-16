import { ApiService } from "./apiService";
import { CollaborationSession } from "@/types/session";

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

export function submitSpeedFeedback(api: ApiService, skillMapId: number, feedback: SpeedFeedback): Promise<void> {
  return api.post<void>(`/skillmaps/${skillMapId}/sessions/active/speed-feedback`, { feedback });
}
