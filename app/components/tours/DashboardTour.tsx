"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { ApiService } from "@/api/apiService";
import { useTourDone } from "@/hooks/useTourDone";

const STEPS: TourStep[] = [
  { title: "Your Profile", content: "This is your profile. There, you can change your username, bio and password, as well as switch your avatar.", target: "user-info-nav", padding: 10 },
  { title: "Join a Map", content: "Join a map your professor or colleague made, using their map code.", target: "join-map-btn", padding: 10 },
  { title: "Your Progress", content: "Track your progress across all maps.", target: "stats-row", padding: 10 },
  { title: "Create a Map", content: "And create a map yourself to start mapping your learning.", target: "create-map-btn", padding: 10 },
];

interface DashboardTourProps {
  api: ApiService;
  onDone: () => void;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ api, onDone }) => {
  const handleDone = useTourDone(api, "hasSeenDashboard", onDone);
  return <TourOverlay steps={STEPS} onFinish={handleDone} onSkip={handleDone} />;
};

export default DashboardTour;
