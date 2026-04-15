/* Skill Map Type */

export interface SkillMap {
  id: number;
  title: string;
  description: string;
  numberOfLevels: number;
  isPublic: boolean;
  inviteCode: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillMapMembership {
  id: number;
  userId: number;
  skillMapId: number;
  role: "OWNER" | "STUDENT";
  joinedAt: string;
}