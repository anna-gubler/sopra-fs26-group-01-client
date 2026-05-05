export interface SkillQuizRef {
  id: number;
}

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
  skillMapId: number;
  createdAt: string;
  updatedAt: string;
  quiz?: SkillQuizRef | null;
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
