import { createContext, useContext } from "react";
import { ApiService } from "@/api/apiService";

export const ApiContext = createContext<ApiService | null>(null);

export function useApiContext(): ApiService {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useApiContext must be used within ApiContext.Provider");
  return api;
}
