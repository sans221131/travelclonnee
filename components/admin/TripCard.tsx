// components/admin/TripCard.tsx
"use client";

import { useState } from "react";
import { TripRequest, Activity, TripStatus } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import StatusActions from "./StatusActions";
import ActivitySelector from "./ActivitySelector";

type TripWithActivities = TripRequest & {
  activities: Activity[];
};

type TripCardProps = {
  trip: TripWithActivities;
  index: number;
  onStatusUpdate?: (tripId: string, newStatus: TripStatus) => void;
};

const statusColors = {
  new: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  quoted: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  closed: "bg-green-500/10 text-green-300 border-green-500/20",
  archived: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
};

export default function TripCard({ trip, index, onStatusUpdate }: TripCardProps) {
  const [currentStatus, setCurrentStatus] = useState<TripStatus>(trip.status);
  const [currentActivities, setCurrentActivities] = useState<Activity[]>(trip.activities);
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalActivityPrice = () => {
    return currentActivities.reduce((total, activity) => {
      return total + parseFloat(activity.price);
    }, 0);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  const handleStatusUpdate = (newStatus: TripStatus) => {
    setCurrentStatus(newStatus);
    if (onStatusUpdate) {
      onStatusUpdate(trip.id, newStatus);
    }
  };

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] backdrop-blur-md shadow-[0_30px_110px_-30px_rgba(0,0,0,.8)] text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[radial-gradient(120px_60px_at_30%_25%,rgba(255,255,255,.08),transparent_60%),radial-gradient(140px_70px_at_70%_75%,rgba(255,255,255,.08),transparent_60%)] px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-zinc-200">
              {index + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">{trip.passengerName}</h3>
              <p className="text-sm text-zinc-400">{trip.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[currentStatus]}`}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
            <span className="text-xs text-zinc-500">
              {formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Trip Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide">Trip Details</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{trip.origin} → {trip.destination}</p>
                  <p className="text-xs text-zinc-500">Route</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                  <p className="text-xs text-zinc-500">Travel Dates</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {trip.adults} Adults{trip.kids > 0 && `, ${trip.kids} Kids`}
                  </p>
                  <p className="text-xs text-zinc-500">Passengers</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{trip.nationality}</p>
                  <p className="text-xs text-zinc-500">Nationality</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <p className="text-sm text-zinc-200">
                  {trip.phoneCountryCode} {trip.phoneNumber}
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h5 className="font-medium text-zinc-200 text-xs uppercase tracking-wide">Preferences</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500">Flight Class:</span>
                  <p className="font-medium text-zinc-300">{trip.flightClass}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Visa Status:</span>
                  <p className="font-medium text-zinc-300">{trip.visaStatus}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Airline:</span>
                  <p className="font-medium text-zinc-300">{trip.airlinePreference}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Hotel:</span>
                  <p className="font-medium text-zinc-300">{trip.hotelPreference}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide">
                Selected Activities
              </h4>
              {currentActivities.length > 0 && (
                <span className="bg-green-500/10 text-green-300 border border-green-500/20 px-2 py-1 rounded-full text-xs font-medium">
                  {currentActivities.length} activities
                </span>
              )}
            </div>

            <div className="mb-4">
              <ActivitySelector
                tripId={trip.id}
                destination={trip.destination}
                currentActivities={currentActivities}
                onActivitiesUpdated={setCurrentActivities}
              />
            </div>

            {currentActivities.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {currentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={activity.imageUrl}
                        alt={activity.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/64x64/27272a/a1a1aa?text=${activity.name.charAt(0)}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-zinc-100 text-sm line-clamp-2">
                          {activity.name}
                        </h5>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-sm text-green-400">
                            {formatPrice(parseFloat(activity.price), activity.currency)}
                          </span>
                          {activity.reviewCount > 0 && (
                            <span className="text-xs text-zinc-500">
                              {activity.reviewCount} reviews
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                </div>
                <p className="text-sm font-medium">No activities selected yet</p>
                <p className="text-xs mt-1 text-zinc-600">Customer hasn't chosen any activities</p>
              </div>
            )}

            {/* Total Activities Cost - Outside activities container for proper alignment */}
            {currentActivities.length > 0 && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-300 text-sm">Total Activities Cost:</span>
                  <span className="font-bold text-lg text-blue-400">
                    {formatPrice(getTotalActivityPrice(), currentActivities[0]?.currency || "USD")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status Management */}
          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide">
              Status Management
            </h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <StatusActions
                tripId={trip.id}
                currentStatus={currentStatus}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>

            {/* Trip Summary */}
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-300">Trip ID:</span>
                  <span className="font-mono text-blue-200">{trip.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-300">Created:</span>
                  <span className="text-blue-200">{formatDate(trip.createdAt)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-300">Last Updated:</span>
                  <span className="text-blue-200">{formatDate(trip.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}