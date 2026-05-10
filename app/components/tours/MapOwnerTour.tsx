"use client";

import React from "react";
import TourOverlay, { TourStep } from "./TourOverlay";
import { ApiService } from "@/api/apiService";
import { useTourDone } from "@/hooks/useTourDone";

const STEPS: TourStep[] = [
  {
    title: "Skills",
    target: "nav-add-skill-btn",
    wide: true,
    sections: [
      { heading: "Add a Skill", body: "Click this button to add a skill to the skillmap. Select the difficulty, the level the skill belongs to, and add a description and references." },
      { heading: "Edit a Skill", body: "Adjust skill settings in the skill directly, after it has been created. You can find this option by clicking on the skill you wish to change." },
      { heading: "Skill Details", body: "Users that click on a skill will see its name, dependencies to previous skills, a description, references and will have the option to rate their level of understanding." },
    ],
  },
  { title: "Edit Map", content: "Edit map details here. Here you can change the name, number of levels, or the public/private status.", target: "nav-edit-btn" },
  { title: "Map Join Code", content: "Share this code with others, to allow them to join your map after publishing it.", target: "nav-invite-code" },
  { title: "Publish", content: "Publish your map with this button, to allow others to join & export your map.", target: "nav-publish-btn" },
  { title: "Map Controls", content: "Navigate the map using the map controls. Zoom in/out, and recenter using the designated button. Scrolling is possible from side to side.", target: "map-controls" },
  { title: "Legend", content: "Reference the legend to understand skill coloring", target: "map-legend" },
  {
    title: "Collaboration Mode",
    wide: true,
    sections: [
      { heading: "General", body: "Use the collaboration mode to interact with your map participants live. Allow them to rate skills in real time, share their current understanding, give feedback on lecture speed, or ask questions, either general or related to a skill." },
      { heading: "Overview", body: "The collaboration mode overview allows you to have the most crucial information, such as average understanding, at a glance." },
      { heading: "Request Current Understanding", body: "This allows you to gague the current understanding of your map participants, and adjust in real time." },
      { heading: "Speed", body: "Participants can give live feedback to lecture or learning speed." },
      { heading: "Q&A", body: "Using general questions or categorizing them by skill, participants can ask questions and upvote them based on urgency." },
      { heading: "Heatmap", body: "Via the heatmap, an overview of skill understanding is given, allowing adjustments to the focus of the collaboration." },
    ],
  },
];

interface MapOwnerTourProps {
  api: ApiService;
  onDone: () => void;
}

const MapOwnerTour: React.FC<MapOwnerTourProps> = ({ api, onDone }) => {
  const handleDone = useTourDone(api, "hasSeenMapOwner", onDone);
  return <TourOverlay steps={STEPS} onFinish={handleDone} onSkip={handleDone} />;
};

export default MapOwnerTour;
