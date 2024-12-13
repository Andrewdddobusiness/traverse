"use client";
import { useState } from "react";
import { useIsMobile } from "@/components/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TimePopover from "@/components/time/timePopover";
import { Badge } from "@/components/ui/badge";
import { DatePickerPopover } from "@/components/date/datePickerPopover";
import { formatCategoryType } from "@/utils/formatting/types";
import { useItineraryActivityStore } from "@/store/itineraryActivityStore";
import { NotesPopover } from "@/components/popover/notesPopover";
import { ChevronDown, ChevronUp, MapPin, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ItineraryTableView() {
  const isMobile = useIsMobile();
  const { itineraryActivities } = useItineraryActivityStore();
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNotesChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case "restaurant":
        return "default";
      case "attraction":
        return "secondary";
      default:
        return "default";
    }
  };

  const groupActivitiesByDate = (activities: typeof itineraryActivities) => {
    const groups: { [key: string]: typeof activities } = {
      unscheduled: [],
    };

    activities.forEach((activity) => {
      if (!activity.date) {
        groups.unscheduled.push(activity);
      } else {
        const date = new Date(activity.date).toISOString().split("T")[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(activity);
      }
    });

    if (groups.unscheduled.length === 0) {
      delete groups.unscheduled;
    }

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      if (dateA === "unscheduled") return 1;
      if (dateB === "unscheduled") return -1;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  };

  const formatDate = (dateString: string) => {
    if (dateString === "unscheduled") return "Unscheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const itineraryActivitiesOnlyActivities = itineraryActivities.filter(
    (itineraryActivity) => itineraryActivity.deleted_at === null
  );

  console.log("itineraryActivitiesOnlyActivities: ", itineraryActivitiesOnlyActivities);

  const groupedActivities = groupActivitiesByDate(itineraryActivitiesOnlyActivities);
  console.log(groupedActivities);

  if (isMobile) {
    return (
      <div className="space-y-6 p-4">
        {groupedActivities.map(([date, activities], groupIndex) => (
          <div key={date} className="space-y-2">
            <h3 className="font-medium text-gray-900">{formatDate(date)}</h3>

            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div
                  key={activity.itinerary_activity_id}
                  className={cn("bg-white rounded-lg shadow-sm border border-gray-200", index !== 0 && "-mt-[1px]")}
                >
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                    onClick={() => toggleCard(activity.itinerary_activity_id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activity.activity?.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          expandedCards[activity.itinerary_activity_id] && "rotate-180"
                        )}
                      />
                    </div>
                  </Button>

                  <div
                    className={cn(
                      "grid transition-all duration-200 ease-in-out",
                      expandedCards[activity.itinerary_activity_id]
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 pt-0 space-y-3 border-t">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Date</div>
                            <DatePickerPopover
                              itineraryActivityId={Number(activity.itinerary_activity_id)}
                              showText={true}
                              styled={true}
                            />
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">Time</div>
                            <TimePopover
                              itineraryActivityId={Number(activity.itinerary_activity_id)}
                              storeStartTime={activity.start_time}
                              storeEndTime={activity.end_time}
                              showText={true}
                              styled={true}
                            />
                          </div>
                        </div>

                        {activity.activity?.address && (
                          <div className="flex items-start space-x-3 text-sm text-gray-600">
                            <MapPin size={16} />
                            <span>{activity.activity.address}</span>
                          </div>
                        )}

                        {activity.activity?.phone_number && (
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <Phone size={16} />
                            <Link href={`tel:${activity.activity.phone_number}`} className="hover:underline">
                              {activity.activity.phone_number}
                            </Link>
                          </div>
                        )}

                        {activity.activity?.website_url && (
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <Globe size={16} />
                            <Link
                              href={activity.activity.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate text-blue-500"
                            >
                              {activity.activity.website_url}
                            </Link>
                          </div>
                        )}

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Notes</div>
                          <NotesPopover
                            id={activity.itinerary_activity_id}
                            value={notes[activity.itinerary_activity_id] || ""}
                            onChange={handleNotesChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md w-full h-full overflow-x-auto bg-white">
      <Table className="relative">
        <TableHeader>
          <TableRow className="flex w-full text-md ">
            <TableHead className="flex items-center w-[20%] min-w-[200px] text-black">Activity Name</TableHead>
            <TableHead className="flex items-center w-[10%] min-w-[100px] text-black">Type</TableHead>
            <TableHead className="flex items-center w-[20%] min-w-[200px] text-blacks">Address</TableHead>
            <TableHead className="flex items-center w-[15%] min-w-[150px] text-black">Date</TableHead>
            <TableHead className="flex items-center w-[15%] min-w-[150px] text-black">Time</TableHead>
            <TableHead className="flex items-center w-[20%] min-w-[200px] text-black">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itineraryActivitiesOnlyActivities.map((activity) => (
            <TableRow key={activity.itinerary_activity_id} className="flex w-full">
              <TableCell className=" w-[20%] min-w-[200px]">{activity.activity?.name}</TableCell>
              <TableCell className="w-[10%] min-w-[100px]">
                {activity.activity?.types && (
                  <Badge variant={getTypeBadgeVariant(activity.activity.types[0])}>
                    <span className="line-clamp-1">{formatCategoryType(activity.activity.types[0])}</span>
                  </Badge>
                )}
              </TableCell>
              <TableCell className="w-[20%] min-w-[200px]">{activity.activity?.address}</TableCell>
              <TableCell className="w-[15%] min-w-[150px]">
                <DatePickerPopover
                  itineraryActivityId={Number(activity.itinerary_activity_id)}
                  showText={true}
                  styled={true}
                />
              </TableCell>
              <TableCell className="w-[15%] min-w-[150px]">
                <TimePopover
                  itineraryActivityId={Number(activity.itinerary_activity_id)}
                  storeStartTime={activity.start_time}
                  storeEndTime={activity.end_time}
                  showText={true}
                  styled={true}
                />
              </TableCell>

              <TableCell className="w-[20%] min-w-[200px]">
                <NotesPopover
                  id={activity.itinerary_activity_id}
                  value={notes[activity.itinerary_activity_id] || ""}
                  onChange={handleNotesChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
