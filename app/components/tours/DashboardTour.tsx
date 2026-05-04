"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { updateMe } from "@/api/userApi";
import { ApiService } from "@/api/apiService";

interface DashboardTourProps {
  api: ApiService;
  onDone: () => void;
}

const STEPS: TourStep[] = [
  {
    title: "Your Profile",
    content: "Filler Text",
    target: "user-info-nav",
    padding: 10,
  },
  {
    title: "Join a Map",
    content: "Filler Text",
    target: "join-map-btn",
    padding: 10,
  },
  {
    title: "Your Progress",
    content: "Filler Text",
    target: "stats-row",
    padding: 10,
  },
  {
    title: "Create a Map",
    content: "Filler Text",
    target: "create-map-btn",
    padding: 10,
  },
];

const DashboardTour: React.FC<DashboardTourProps> = ({ api, onDone }) => {
  const markSeen = () => {
    updateMe(api, { hasSeenDashboard: true }).catch(() => {});
  };

  const handleFinish = () => {
    markSeen();
    onDone();
  };

  const handleSkip = () => {
    markSeen();
    onDone();
  };

  return <TourOverlay steps={STEPS} onFinish={handleFinish} onSkip={handleSkip} />;
};

export default DashboardTour;
