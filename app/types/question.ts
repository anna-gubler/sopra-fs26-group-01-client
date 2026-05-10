export interface Question {
  id: number;
  sessionId: number;
  skillId: number | null;
  text: string;
  upvoteCount: number;
  isAddressed: boolean;
  createdAt: string;
}
