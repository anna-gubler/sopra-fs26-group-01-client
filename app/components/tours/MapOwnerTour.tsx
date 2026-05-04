"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { updateMe } from "@/api/userApi";
import { ApiService } from "@/api/apiService";

interface MapOwnerTourProps {
  api: ApiService;
  onDone: () => void;
}

const MapOwnerTour: React.FC<MapOwnerTourProps> = ({ api, onDone }) => {
  const markSeen = () => {
    updateMe(api, { hasSeenMapOwner: true }).catch(() => {});
  };

  const handleFinish = () => { markSeen(); onDone(); };
  const handleSkip = () => { markSeen(); onDone(); };

  const steps: TourStep[] = [
    {
      title: "Skills",
      target: "nav-add-skill-btn",
      wide: true,
      sections: [
        { heading: "Add a Skill", body: "Filler Text" },
        { heading: "Edit a Skill", body: "Filler Text" },
        { heading: "Skill Details", body: "Filler Text" },
      ],
    },
    { title: "Edit Map", content: "Filler Text", target: "nav-edit-btn" },
    { title: "Map Join Code", content: "Filler Text", target: "nav-invite-code" },
    { title: "Publish", content: "Filler Text", target: "nav-publish-btn" },
    { title: "Map Controls", content: "Filler Text", target: "map-controls" },
    { title: "Legend", content: "Filler Text", target: "map-legend" },
    {
      title: "Collaboration Mode",
      wide: true,
      sections: [
        { heading: "Overview", body: "Filler Text" },
        { heading: "Request Current Understanding", body: "Filler Text" },
        { heading: "Heatmap", body: "Filler Text" },
        { heading: "Speed", body: "Filler Text" },
        { heading: "Q&A", body: "Filler Text" },
      ],
    },
  ];

  return <TourOverlay steps={steps} onFinish={handleFinish} onSkip={handleSkip} />;
};

export default MapOwnerTour;
