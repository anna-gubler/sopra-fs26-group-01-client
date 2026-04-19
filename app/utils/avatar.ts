
export function getAvatarUrl(seed: string | null, style: string | null): string {
  const s = seed ?? "default";
  const st = style ?? "bottts";
  return `https://api.dicebear.com/9.x/${st}/svg?seed=${encodeURIComponent(s)}`;
}