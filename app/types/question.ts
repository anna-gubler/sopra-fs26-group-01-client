export interface Question {
  id: number;
  sessionId: number;
  skillId: number;
  text: string;
  upvotes: number;
  isAddressed: boolean;
  createdAt: string;
}
