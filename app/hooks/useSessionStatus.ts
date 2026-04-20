import { useState, useEffect, useCallback, useRef } from "react";
import { ApiService } from "@/api/apiService";
import { getActiveSession } from "@/api/sessionApi";
import { CollaborationSession } from "@/types/session";

const POLL_INTERVAL_MS = 3000;

interface SessionStatus {
  session: CollaborationSession | null;
  isActive: boolean;
  loading: boolean;
  refresh: () => void;
  setSession: (s: CollaborationSession | null) => void;
}

export function useSessionStatus(api: ApiService, skillMapId: number): SessionStatus {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const raw = await getActiveSession(api, skillMapId);
      const data: CollaborationSession = {
        ...raw,
        isActive: raw.isActive ?? (raw as unknown as { active: boolean }).active,
      };
      setSession(data);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        // Confirmed no active session
        setSession(null);
      }
      // For 403 or other errors, leave session state unchanged
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
    setSession,
  };
}
