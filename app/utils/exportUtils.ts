import { exportSkillMap } from "@/api/skillmapApi";
import { ApiService } from "@/api/apiService";
import { ApplicationError } from "@/types/error";
import toast from "react-hot-toast";

export async function downloadSkillMapExport(api: ApiService, id: number, title: string): Promise<void> {
  try {
    const blob = await exportSkillMap(api, id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Skill map exported!");
  } catch (err) {
    toast.error((err as ApplicationError).details ?? "Failed to export skill map.");
  }
}
