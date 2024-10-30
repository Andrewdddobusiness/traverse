import React from "react";
import ActivityCard from "./activityCard";
import { IActivityWithLocation } from "@/store/activityStore";
import { useSidebarStore } from "@/store/sidebarStore";
import ActivitySkeletonCard from "./activitySkeletonCard";

interface IActivityCardsProps {
  activities: IActivityWithLocation[];
  onSelectActivity: (activity: IActivityWithLocation) => void;
  // onHover: (coordinates: [number, number]) => void;
}

export default function ActivitySkeletonCards() {
  const { isSidebarOpen } = useSidebarStore();

  return (
    <div
      className={`grid ${
        isSidebarOpen
          ? "grid-cols-1 3xl:grid-cols-2 6xl:grid-cols-3"
          : "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 4xl:grid-cols-4 6xl:grid-cols-5"
      } gap-4 pb-8`}
    >
      <ActivitySkeletonCard />
    </div>
  );
}