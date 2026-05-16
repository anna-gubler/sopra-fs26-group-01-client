import { useState, useEffect, useCallback, useRef } from "react";
import { useApiContext } from "@/context/ApiContext";
import { getSkillMapMembers } from "@/api/skillmapApi";

const POLL_INTERVAL_MS = 3000;

export interface RatingAggregate {
  avg: number;
  count: number;
}

interface SkillUnderstandingAggregate {
  skillId: number;
  avg: number;
  count: number;
}

export interface SessionRatingsResult {
  aggregated: Map<number, RatingAggregate>;
  totalStudents: number;
}

export function useSessionRatings(
  _sessionId: number,
  skillMapId: number
): SessionRatingsResult {
  const api = useApiContext();
  const [aggregated, setAggregated] = useState<Map<number, RatingAggregate>>(
    new Map()
  );
  const [totalStudents, setTotalStudents] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRatings = useCallback(async () => {
    // Keep the two fetches independent so a failure in one doesn't block the other
    try {
      const understandings = await (api.get(`/skillmaps/${skillMapId}/skills/understanding`) as Promise<SkillUnderstandingAggregate[]>);
      const result = new Map<number, RatingAggregate>();
      for (const su of understandings) {
        result.set(su.skillId, { avg: su.avg, count: su.count });
      }
      setAggregated(result);
    } catch {
      // silently ignore poll errors
    }
    try {
      const members = await getSkillMapMembers(api, skillMapId);
      setTotalStudents(members.filter((m) => m.role === "STUDENT").length);
    } catch {
      // silently ignore poll errors
    }
  }, [api, skillMapId]);

  useEffect(() => {
    fetchRatings();
    intervalRef.current = setInterval(fetchRatings, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRatings]);

  return { aggregated, totalStudents };
}
