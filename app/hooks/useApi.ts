import { ApiService } from "@/api/apiService";
import { useMemo } from "react"; // think of usememo like a singleton, it ensures only one instance exists
import useLocalStorage from "@/hooks/useLocalStorage";

// Added Auth Header functionality
//Bridge between token in local storage and API Service
export const useApi = () => {
  const { value: token } = useLocalStorage<string>("token", "");
  return useMemo(() => new ApiService(token), [token]);
};
