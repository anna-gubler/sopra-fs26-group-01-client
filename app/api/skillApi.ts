import { ApiService } from "./apiService";
import { Skill } from "@/types/skill";

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
