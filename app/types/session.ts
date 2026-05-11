export interface CollaborationSession {
  id: number;
  skillMapId: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  speedFeedback: string | null;
  ratingSummary: number;
  updatedAt: string;
  tooSlowCount?: number;
  okCount?: number;
  tooFastCount?: number;
  currentUnderstandingActive?: boolean;
  currentUnderstandingStartedAt?: string | null;
}
