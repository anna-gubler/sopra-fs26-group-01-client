import { useState, useEffect } from "react";
import { getRemainingSeconds } from "@/utils/time";

export function useCountdown(startedAt: string | null, durationSeconds: number): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!startedAt) { setRemaining(0); return; }
    const update = () => setRemaining(Math.round(getRemainingSeconds(startedAt, durationSeconds)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationSeconds]);

  return remaining;
}
