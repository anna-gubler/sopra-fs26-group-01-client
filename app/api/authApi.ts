import { ApiService } from "./apiService";

export interface AuthResponse {
  token: string | null;
  id: number | null;
}

export function login(api: ApiService, username: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", { username, password });
}

export function register(
  api: ApiService,
  data: { username: string; password: string; bio?: string },
): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", data);
}

export function logout(api: ApiService): Promise<void> {
  return api.post<void>("/auth/logout", {});
}
