import { ApiService } from "./apiService";
import { Skill, Dependency } from "@/types/skill";

export function createSkill(
  api: ApiService,
  skillMapId: number,
  data: { name: string; description?: string; level: number; difficulty?: string; resources?: string; positionX: number },
): Promise<Skill> {
  return api.post<Skill>(`/skillmaps/${skillMapId}/skills`, data);
}

export function updateSkill(
  api: ApiService,
  skillId: number,
  data: { name?: string; description?: string; difficulty?: string; resources?: string },
): Promise<Skill> {
  return api.patch<Skill>(`/skills/${skillId}`, data);
}

export function deleteSkill(api: ApiService, skillId: number): Promise<void> {
  return api.delete<void>(`/skills/${skillId}`);
}

export function createDependency(
  api: ApiService,
  skillMapId: number,
  fromSkillId: number,
  toSkillId: number,
): Promise<Dependency> {
  return api.post<Dependency>(`/skillmaps/${skillMapId}/dependencies`, { fromSkillId, toSkillId });
}

export function deleteDependency(api: ApiService, dependencyId: number): Promise<void> {
  return api.delete<void>(`/dependencies/${dependencyId}`);
}
