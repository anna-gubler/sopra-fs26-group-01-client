import { ApiService } from "./apiService";
import { User } from "@/types/user";

export function getMe(api: ApiService): Promise<User> {
  return api.get<User>("/users/me");
}

export function getUser(api: ApiService, id: string | number): Promise<User> {
  return api.get<User>(`/users/${id}`);
}

export function updateMe(api: ApiService, data: Partial<User>): Promise<User> {
  return api.put<User>("/users/me", data);
}

export function changePassword(
  api: ApiService,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  return api.patch<void>("/users/me/password", { oldPassword, newPassword, confirmPassword });
}
