"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { ApiService } from "@/api/apiService";
import { useTourDone } from "@/hooks/useTourDone";

const STEPS: TourStep[] = [
  { title: "Skill Map", content: "This is a skillmap. It allows a more structured overview over lecture and learning content. Explore skills and their contents, or engage with people via the collaboration mode, that can be started by the map owner.", target: "skill-map-graph" },
  { title: "Map Controls", content: "Navigate the map using the map controls. Zoom in/out, and recenter using the designated button. Scrolling is possible from side to side.", target: "map-controls" },
  { title: "Legend", content: "Reference the legend to understand skill coloring", target: "map-legend" },
  {
    title: "Skill Info",
    wide: true,
    sections: [
      { heading: "Description", body: "The description gives a short overview over the skills contents." },
      { heading: "Resources", body: "Links and related ressources that help understanding of the skill can be found in this section." },
      { heading: "Prerequisites", body: "This allows a clear overview as to what is required to approach this skill. Always familiarize yourself with the prerequisites first." },
      { heading: "Understanding", body: "Rate your personal skill understanding here. This understanding will be shared with the map owner in collaboration sessions." },
    ],
  },
  {
    title: "Collaboration Mode",
    wide: true,
    sections: [
      { heading: "General", body: "Collaboration mode lets you engage with your map live. Rate skills in real time, share your current understanding, give feedback on lecture speed, or ask questions, either general or tied to a specific skill." },
      { heading: "Overview", body: "The collaboration mode overview surfaces the most important info at a glance, like average understanding across all participants." },
      { heading: "Share Your Understanding", body: "Let your instructor know where you're at so they can adjust the pace or focus in real time." },
      { heading: "Speed", body: "Give live feedback on whether the lecture or learning pace is working for you." },
      { heading: "Q&A", body: "Ask questions, either general or linked to a specific skill, and upvote others' questions based on how urgent they feel." },
      { heading: "Heatmap", body: "See how understanding is distributed across all skills, so everyone has a clear picture of where the group stands." },
    ],
  },
];

interface MapUserTourProps {
  api: ApiService;
  onDone: () => void;
}

const MapUserTour: React.FC<MapUserTourProps> = ({ api, onDone }) => {
  const handleDone = useTourDone(api, "hasSeenMapUser", onDone);
  return <TourOverlay steps={STEPS} onFinish={handleDone} onSkip={handleDone} />;
};

export default MapUserTour;
