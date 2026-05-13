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
    try {
      const [understandings, members]: [SkillUnderstandingAggregate[], Awaited<ReturnType<typeof getSkillMapMembers>>] = await Promise.all([
        api.get(`/skillmaps/${skillMapId}/skills/understanding`) as Promise<SkillUnderstandingAggregate[]>,
        getSkillMapMembers(api, skillMapId),
      ]);
      const studentCount = members.filter((m) => m.role === "STUDENT").length;
      setTotalStudents(studentCount);
      const result = new Map<number, RatingAggregate>();
      for (const su of understandings) {
        result.set(su.skillId, { avg: su.avg, count: su.count });
      }
      setAggregated(result);
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
