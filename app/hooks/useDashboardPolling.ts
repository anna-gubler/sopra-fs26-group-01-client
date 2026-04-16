import { useState, useEffect, useCallback, useRef } from "react";
import { ApiService } from "@/api/apiService";
import { getSkillMapGraph } from "@/api/skillmapApi";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { Skill } from "@/types/skill";

const POLL_INTERVAL_MS = 5000;

export interface DashboardPollingResult extends ReturnType<typeof useSessionStatus> {
  liveSkills: Skill[] | null;
}

export function useDashboardPolling(api: ApiService, skillMapId: number): DashboardPollingResult {
  const sessionStatus = useSessionStatus(api, skillMapId);
  const { isActive } = sessionStatus;
  const [liveSkills, setLiveSkills] = useState<Skill[] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      const graph = await getSkillMapGraph(api, skillMapId);
      setLiveSkills(graph.skills);
    } catch {
      // silently fail — stale data is acceptable between polls
    }
  }, [api, skillMapId]);

  useEffect(() => {
    if (!isActive) {
      setLiveSkills(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    fetchGraph();
    intervalRef.current = setInterval(fetchGraph, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, fetchGraph]);

  return { ...sessionStatus, liveSkills };
}
