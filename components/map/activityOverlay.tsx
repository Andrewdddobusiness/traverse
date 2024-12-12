"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CommentsCarousel from "@/components/carousel/reviewsCarousel";
import ImagesCarousel from "@/components/carousel/imagesCarousel";
import Rating from "@/components/rating/rating";
import { Skeleton } from "@/components/ui/skeleton";

import { Globe, Clock, Loader2, X, Phone, ImageOff, MapPin } from "lucide-react";
import { capitalizeFirstLetterOfEachWord } from "@/utils/formatting/capitalise";
import { formatOpenHours } from "@/utils/formatting/datetime";

import { useItineraryActivityStore } from "@/store/itineraryActivityStore";
import { IActivityWithLocation, useActivitiesStore } from "@/store/activityStore";
import { useMapStore } from "@/store/mapStore";

interface ActivityOverlayProps {
  onClose: () => void;
}

const getDayName = (dayNumber: number) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayNumber];
};

export function ActivityOverlay({ onClose }: ActivityOverlayProps) {
  // Reuse the existing logic from AppSidebarItineraryActivityRight
  let { itineraryId, destinationId } = useParams();
  const { selectedActivity } = useActivitiesStore();
  const { insertItineraryActivity, removeItineraryActivity, isActivityAdded } = useItineraryActivityStore();
  const [loading, setLoading] = useState<boolean>(false);
  const { setTempMarker } = useMapStore();

  const isAdded = isActivityAdded(selectedActivity?.place_id || "");

  // Handlers remain the same as in AppSidebarItineraryActivityRight
  const handleAddToItinerary = async () => {
    setLoading(true);
    if (!selectedActivity || !itineraryId || !destinationId) return;
    await insertItineraryActivity(
      selectedActivity as IActivityWithLocation,
      itineraryId.toString(),
      destinationId.toString()
    );
    setLoading(false);
  };

  const handleRemoveToItinerary = async () => {
    setLoading(true);
    if (!selectedActivity || !itineraryId) return;
    await removeItineraryActivity(selectedActivity.place_id, itineraryId.toString());
    setLoading(false);
  };

  // Add the renderOpeningHours function from appSidebarItineraryActivityRight
  const renderOpeningHours = () => {
    if (!selectedActivity || !selectedActivity.open_hours) {
      return <p>Opening hours not available</p>;
    }

    const periods = selectedActivity.open_hours;

    // Check if it's open 24/7
    if (
      periods.length === 0 ||
      (periods.length === 1 &&
        periods[0].open_hour === 0 &&
        periods[0].open_minute === 0 &&
        periods[0].close_hour === 23 &&
        periods[0].close_minute === 59)
    ) {
      return (
        <div className="grid grid-cols-[120px_1fr] items-center">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
            <React.Fragment key={day}>
              <div className="text-sm font-medium py-0.5">{day}:</div>
              <div className="text-sm">Open 24 hours</div>
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Create an object to store unique days
    const uniquePeriods = periods.reduce((acc: { [key: number]: any }, period) => {
      if (!(period.day in acc)) {
        acc[period.day] = period;
      }
      return acc;
    }, {});

    // Convert back to array and sort by day
    const uniqueSortedPeriods = Object.values(uniquePeriods).sort((a, b) => a.day - b.day);

    return uniqueSortedPeriods.map((period: any) => (
      <div key={period.day} className="grid grid-cols-[120px_1fr] items-center py-0.5">
        <div className="text-sm font-medium">{getDayName(period.day)}:</div>
        <div className="text-sm">
          {formatOpenHours(period.day, period.open_hour, period.open_minute)} -{" "}
          {formatOpenHours(period.day, period.close_hour, period.close_minute)}
        </div>
      </div>
    ));
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 mx-4 mb-4 h-[40vh] bg-white rounded-3xl shadow-lg">
      <div className="relative flex flex-col h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -right-4 -top-4 z-10 rounded-full bg-gray-50 hover:bg-gray-100 w-10 h-10 shadow-lg transition-all duration-300"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 pt-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-3xl">
              {/* Left Column - Details */}
              <div className="flex flex-col gap-4">
                {/* Title and Rating */}
                <div>
                  <h2 className="text-xl font-semibold">
                    {capitalizeFirstLetterOfEachWord(selectedActivity?.name || "Unnamed Location")}
                  </h2>
                  {selectedActivity?.rating && (
                    <div className="flex items-center gap-2 mt-1">
                      <Rating rating={selectedActivity.rating} />
                      <span className="text-sm text-gray-500">{selectedActivity.rating}</span>
                    </div>
                  )}
                </div>

                {/* Images - Moved inside left column for mobile, will move to right on lg screens */}
                <div className="lg:hidden">
                  {selectedActivity?.photo_names && selectedActivity.photo_names.length > 0 ? (
                    <div className="rounded-3xl flex flex-col w-full">
                      <ImagesCarousel
                        photoNames={selectedActivity.photo_names}
                        showButtons={true}
                        height="h-64"
                        width="w-full"
                        className="rounded-3xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-3xl flex flex-col items-center justify-center bg-gray-50">
                      <ImageOff size={32} />
                      <p className="text-gray-500 text-sm">No images available</p>
                    </div>
                  )}
                </div>

                {/* Tags - Limited to 2 */}
                {selectedActivity?.types && (
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.types.slice(0, 2).map((type: string) => (
                      <span key={type} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {capitalizeFirstLetterOfEachWord(type.replace(/_/g, " "))}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Info Section */}
                <div className="flex flex-col gap-4">
                  {/* Address */}
                  {selectedActivity?.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedActivity.address}</span>
                    </div>
                  )}

                  {/* Website */}
                  {selectedActivity?.website_url && (
                    <Link
                      href={selectedActivity.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </Link>
                  )}

                  {/* Phone */}
                  {selectedActivity?.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{selectedActivity.phone_number}</span>
                    </div>
                  )}

                  {/* Opening Hours */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="opening-hours">
                      <AccordionTrigger className="flex gap-2 text-sm p-0">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-normal">Opening Hours</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pt-2">{renderOpeningHours()}</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              {/* Right Column - Images (only visible on lg screens) */}
              <div className="hidden lg:flex flex-col items-center justify-start">
                {selectedActivity?.photo_names && selectedActivity.photo_names.length > 0 ? (
                  <div className="rounded-3xl flex flex-col w-full">
                    <ImagesCarousel
                      photoNames={selectedActivity.photo_names}
                      showButtons={true}
                      height="h-64"
                      width="w-full"
                      className="rounded-3xl"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-3xl flex flex-col items-center justify-center bg-gray-50">
                    <ImageOff size={32} />
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            {selectedActivity?.reviews && selectedActivity.reviews.length > 0 && (
              <div className="mt-2">
                <CommentsCarousel reviews={selectedActivity.reviews} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer with action button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white rounded-b-3xl">
          {loading ? (
            <Button disabled className="w-full rounded-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : isAdded ? (
            <Button variant="secondary" className="w-full rounded-full" onClick={handleRemoveToItinerary}>
              Remove from Itinerary
            </Button>
          ) : (
            <Button variant="default" className="w-full rounded-full" onClick={handleAddToItinerary}>
              Add to Itinerary
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
