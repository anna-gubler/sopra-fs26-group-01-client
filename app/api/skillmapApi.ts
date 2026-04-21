import { ApiService } from "./apiService";
import { SkillMap, SkillMapMembership } from "@/types/skillmap";
import { GraphResponse } from "@/types/skill";

export function getSkillMaps(api: ApiService): Promise<SkillMap[]> {
  return api.get<SkillMap[]>("/skillmaps");
}

export function getSkillMap(api: ApiService, id: number): Promise<SkillMap> {
  return api.get<SkillMap>(`/skillmaps/${id}`);
}

export function createSkillMap(
  api: ApiService,
  data: { title: string; description: string; numberOfLevels: number; isPublic: boolean },
): Promise<SkillMap> {
  return api.post<SkillMap>("/skillmaps", data);
}

export function updateSkillMap(
  api: ApiService,
  id: number,
  data: { title?: string; description?: string; numberOfLevels?: number; isPublic?: boolean },
): Promise<SkillMap> {
  return api.patch<SkillMap>(`/skillmaps/${id}`, data);
}

export function joinSkillMap(api: ApiService, inviteCode: string): Promise<SkillMapMembership> {
  return api.post<SkillMapMembership>("/skillmaps/join", { inviteCode });
}

export function getSkillMapGraph(api: ApiService, id: number): Promise<GraphResponse> {
  return api.get<GraphResponse>(`/skillmaps/${id}/graph`);
}

export function getSkillMapMembers(api: ApiService, id: number): Promise<SkillMapMembership[]> {
  return api.get<SkillMapMembership[]>(`/skillmaps/${id}/members`);
}
