"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { updateMe } from "@/api/userApi";
import { ApiService } from "@/api/apiService";

interface MapUserTourProps {
  api: ApiService;
  onDone: () => void;
}

const MapUserTour: React.FC<MapUserTourProps> = ({ api, onDone }) => {
  const markSeen = () => {
    updateMe(api, { hasSeenMapUser: true }).catch(() => {});
  };

  const handleFinish = () => { markSeen(); onDone(); };
  const handleSkip = () => { markSeen(); onDone(); };

  const steps: TourStep[] = [
    { title: "Skill Map", content: "Filler Text", target: "skill-map-graph" },
    { title: "Map Controls", content: "Filler Text", target: "map-controls" },
    { title: "Legend", content: "Filler Text", target: "map-legend" },
    {
      title: "Skill Info",
      wide: true,
      sections: [
        { heading: "Description", body: "Filler Text" },
        { heading: "Resources", body: "Filler Text" },
        { heading: "Prerequisites", body: "Filler Text" },
        { heading: "Understanding", body: "Filler Text" },
        { heading: "Notes", body: "Filler Text" },
      ],
    },
  ];

  return <TourOverlay steps={steps} onFinish={handleFinish} onSkip={handleSkip} />;
};

export default MapUserTour;
