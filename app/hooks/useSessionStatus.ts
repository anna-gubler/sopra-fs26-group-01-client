import { useState, useEffect, useCallback, useRef } from "react";
import { ApiService } from "@/api/apiService";
import { getActiveSession } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";

const POLL_INTERVAL_MS = 5000;

interface SessionStatus {
  session: CollaborationSession | null;
  isActive: boolean;
  loading: boolean;
  refresh: () => void;
}

export function useSessionStatus(api: ApiService, skillMapId: number): SessionStatus {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = await getActiveSession(api, skillMapId);
      setSession(data);
    } catch {
      // 404 or no active session — treat as no active session
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [api, skillMapId]);

  useEffect(() => {
    fetchSession();
    intervalRef.current = setInterval(fetchSession, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchSession]);

  return {
    session,
    isActive: session?.isActive ?? false,
    loading,
    refresh: fetchSession,
  };
}
