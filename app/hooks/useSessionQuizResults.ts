import { useState, useEffect, useCallback, useRef } from "react";
import { useApiContext } from "@/context/ApiContext";
import { getSessionQuizResults } from "@/api/sessionApi";
import { DashboardQuizSummary } from "@/types/quiz";

const POLL_INTERVAL_MS = 3000;

export function useSessionQuizResults(skillMapId: number): DashboardQuizSummary[] {
  const api = useApiContext();
  const [results, setResults] = useState<DashboardQuizSummary[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const data = await getSessionQuizResults(api, skillMapId);
      setResults(data);
    } catch {
      // silently ignore poll errors
    }
  }, [api, skillMapId]);

  useEffect(() => {
    fetchResults();
    intervalRef.current = setInterval(fetchResults, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchResults]);

  return results;
}
