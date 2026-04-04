import { ApiService } from "@/api/apiService";
import { useMemo } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

// Read token synchronously from localStorage so ApiService has it on first render,
// before useLocalStorage's useEffect has a chance to run.
const getStoredToken = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const stored = localStorage.getItem("token");
    return stored ? (JSON.parse(stored) as string) : "";
  } catch {
    return "";
  }
};

// Bridge between token in localStorage and ApiService instance
export const useApi = () => {
  const { value: token } = useLocalStorage<string>("token", "");
  // Use the hook value when available, fall back to the synchronous read on first render
  const effectiveToken = token || getStoredToken();
  return useMemo(() => new ApiService(effectiveToken), [effectiveToken]);
};
