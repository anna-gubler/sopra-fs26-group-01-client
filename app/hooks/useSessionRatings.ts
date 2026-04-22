import { useState, useEffect, useCallback, useRef } from "react";
import { useApiContext } from "@/context/ApiContext";
import { getSkillMapMembers } from "@/api/skillmapApi";

const POLL_INTERVAL_MS = 3000;

export interface RatingAggregate {
  avg: number;
  count: number;
}

interface UnderstandingRating {
  id: number;
  sessionId: number;
  skillId: number;
  rating: number;
  submittedAt: string;
  updatedAt: string;
}

export interface SessionRatingsResult {
  aggregated: Map<number, RatingAggregate>;
  totalStudents: number;
}

export function useSessionRatings(
  sessionId: number,
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
      const [ratings, members]: [UnderstandingRating[], Awaited<ReturnType<typeof getSkillMapMembers>>] = await Promise.all([
        api.get(`/sessions/${sessionId}/ratings`) as Promise<UnderstandingRating[]>,
        getSkillMapMembers(api, skillMapId),
      ]);
      const studentCount = members.filter((m) => m.role === "STUDENT").length;
      setTotalStudents(studentCount);
      const grouped = new Map<number, number[]>();
      for (const r of ratings) {
        if (!grouped.has(r.skillId)) grouped.set(r.skillId, []);
        grouped.get(r.skillId)!.push(r.rating);
      }
      const result = new Map<number, RatingAggregate>();
      grouped.forEach((vals, skillId) => {
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        result.set(skillId, { avg, count: vals.length });
      });
      setAggregated(result);
    } catch {
      // silently ignore poll errors
    }
  }, [api, sessionId, skillMapId]);

  useEffect(() => {
    fetchRatings();
    intervalRef.current = setInterval(fetchRatings, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRatings]);

  return { aggregated, totalStudents };
}
