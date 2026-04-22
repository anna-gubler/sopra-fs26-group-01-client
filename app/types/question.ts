export interface Question {
  id: number;
  sessionId: number;
  skillId: number;
  text: string;
  upvoteCount: number;
  isAddressed: boolean;
  createdAt: string;
}
