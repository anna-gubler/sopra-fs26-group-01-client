import { useState, useEffect } from "react";

export function useCooldown(seconds: number): [number, () => void] {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const start = () => setCooldown(seconds);
  return [cooldown, start];
}
