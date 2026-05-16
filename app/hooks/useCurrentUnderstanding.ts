import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { triggerCurrentUnderstanding, submitCurrentUnderstanding } from "@/api/sessionApi";
import { getSkillMapMembers } from "@/api/skillmapApi";
import { ApiService } from "@/api/apiService";
import { getApiDomain } from "@/utils/domain";

const DURATION_SECONDS = 180;

export interface CUResults {
  avg: number;
  count: number;
}

export interface UseCurrentUnderstanding {
  isActive: boolean;
  startedAt: string | null;
  results: CUResults | null;
  totalStudents: number;
  trigger: () => Promise<void>;
  submit: (rating: number) => Promise<void>;
}

export function useCurrentUnderstanding(
  api: ApiService,
  skillMapId: number,
  sessionId: number
): UseCurrentUnderstanding {
  const [isActive, setIsActive] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [results, setResults] = useState<CUResults | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const stompRef = useRef<Client | null>(null);

  // Fetch student count once on mount
  useEffect(() => {
    getSkillMapMembers(api, skillMapId)
      .then((members) => setTotalStudents(members.filter((m) => m.role === "STUDENT").length))
      .catch(() => {});
  }, [api, skillMapId]);

  // WebSocket connection
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/skillmaps/${skillMapId}/live`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.type === "UNDERSTANDING_REQUESTED") {
            setIsActive(true);
            setStartedAt(new Date().toISOString());
            setResults(null);
          } else if (data.type === "UNDERSTANDING_UPDATED") {
            setResults({
              avg: Math.round(data.averageRating),
              count: data.totalResponses,
            });
          }
        });
      },
    });
    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [skillMapId]);

  // Auto-expire after DURATION_SECONDS
  useEffect(() => {
    if (!isActive || !startedAt) return;
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    const remaining = Math.max(0, DURATION_SECONDS - elapsed);
    if (remaining <= 0) { setIsActive(false); return; }
    const t = setTimeout(() => setIsActive(false), remaining * 1000);
    return () => clearTimeout(t);
  }, [isActive, startedAt]);

  const trigger = useCallback(async () => {
    await triggerCurrentUnderstanding(api, sessionId);
    // Owner won't receive their own WS broadcast, so update local state directly
    setIsActive(true);
    setStartedAt(new Date().toISOString());
    setResults(null);
  }, [api, sessionId]);

  const submit = useCallback(async (rating: number) => {
    await submitCurrentUnderstanding(api, sessionId, rating);
  }, [api, sessionId]);

  return { isActive, startedAt, results, totalStudents, trigger, submit };
}
