import { useState, useEffect, useCallback, useRef } from "react";
import { ApiService } from "@/api/apiService";
import { getSkillMapGraph } from "@/api/skillmapApi";
import { getQuestions } from "@/api/sessionApi";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { Skill } from "@/types/skill";
import { Question } from "@/types/question";

const POLL_INTERVAL_MS = 5000;

export interface DashboardPollingResult extends ReturnType<typeof useSessionStatus> {
  liveSkills: Skill[] | null;
  liveQuestions: Question[] | null;
}

export function useDashboardPolling(api: ApiService, skillMapId: number): DashboardPollingResult {
  const sessionStatus = useSessionStatus(api, skillMapId);
  const { isActive, session } = sessionStatus;
  const [liveSkills, setLiveSkills] = useState<Skill[] | null>(null);
  const [liveQuestions, setLiveQuestions] = useState<Question[] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLiveData = useCallback(async () => {
    await Promise.allSettled([
      getSkillMapGraph(api, skillMapId).then((graph) => setLiveSkills(graph.skills)).catch(() => {}),
      session?.id
        ? getQuestions(api, session.id).then(setLiveQuestions).catch(() => {})
        : Promise.resolve(),
    ]);
  }, [api, skillMapId, session?.id]);

  useEffect(() => {
    if (!isActive) {
      setLiveSkills(null);
      setLiveQuestions(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    fetchLiveData();
    intervalRef.current = setInterval(fetchLiveData, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, fetchLiveData]);

  return { ...sessionStatus, liveSkills, liveQuestions };
}
