"use client";

import { useCallback } from "react";
import { ApiService } from "@/api/apiService";
import { updateMe } from "@/api/userApi";

type SeenKey = "hasSeenDashboard" | "hasSeenMapOwner" | "hasSeenMapUser";

export function useTourDone(api: ApiService, seenKey: SeenKey, onDone: () => void): () => void {
  return useCallback(() => {
    updateMe(api, { [seenKey]: true }).catch(() => {});
    onDone();
  }, [api, seenKey, onDone]);
}
