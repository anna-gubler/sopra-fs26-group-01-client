export function getRemainingSeconds(startedAt: string, durationSeconds: number): number {
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, durationSeconds - elapsed);
}
