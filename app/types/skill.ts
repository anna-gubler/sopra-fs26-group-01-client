export interface Skill {
  id: number;
  name: string;
  description: string;
  level: number;
  positionX: number;
  resources: string;
  difficulty: string;
  isLocked: boolean;
  isUnderstood: boolean;
  skillUnderstandingRating: number | null;
  skillMapId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Dependency {
  id: number;
  fromSkillId: number;
  toSkillId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphResponse {
  skills: Skill[];
  dependencies: Dependency[];
}
