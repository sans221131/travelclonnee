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
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  quoted: "bg-purple-100 text-purple-800 border-purple-200",
  closed: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  new: "🆕",
  contacted: "📞",
  quoted: "💰",
  closed: "✅",
  archived: "📁",
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
              {index + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{trip.passengerName}</h3>
              <p className="text-sm text-gray-600">{trip.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[currentStatus]}`}>
              {statusIcons[currentStatus]} {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Trip Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Trip Details</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✈️</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{trip.origin} → {trip.destination}</p>
                  <p className="text-xs text-gray-500">Route</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                  <p className="text-xs text-gray-500">Travel Dates</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {trip.adults} Adults{trip.kids > 0 && `, ${trip.kids} Kids`}
                  </p>
                  <p className="text-xs text-gray-500">Passengers</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏳️</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{trip.nationality}</p>
                  <p className="text-xs text-gray-500">Nationality</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📱</span>
                <p className="text-sm text-gray-900">
                  {trip.phoneCountryCode} {trip.phoneNumber}
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <h5 className="font-medium text-gray-900 text-xs uppercase tracking-wide">Preferences</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Flight Class:</span>
                  <p className="font-medium">{trip.flightClass}</p>
                </div>
                <div>
                  <span className="text-gray-500">Visa Status:</span>
                  <p className="font-medium">{trip.visaStatus}</p>
                </div>
                <div>
                  <span className="text-gray-500">Airline:</span>
                  <p className="font-medium">{trip.airlinePreference}</p>
                </div>
                <div>
                  <span className="text-gray-500">Hotel:</span>
                  <p className="font-medium">{trip.hotelPreference}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Selected Activities
              </h4>
              {currentActivities.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
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
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={activity.imageUrl}
                        alt={activity.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/64x64/f3f4f6/6b7280?text=${activity.name.charAt(0)}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {activity.name}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-sm text-green-600">
                            {formatPrice(parseFloat(activity.price), activity.currency)}
                          </span>
                          {activity.reviewCount > 0 && (
                            <span className="text-xs text-gray-500">
                              ⭐ {activity.reviewCount} reviews
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-4xl mb-2 block">🎯</span>
                <p className="text-sm font-medium">No activities selected yet</p>
                <p className="text-xs mt-1 text-gray-400">Customer hasn't chosen any activities</p>
              </div>
            )}

            {/* Total Activities Cost - Outside activities container for proper alignment */}
            {currentActivities.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900 text-sm">Total Activities Cost:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatPrice(getTotalActivityPrice(), currentActivities[0]?.currency || "USD")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status Management */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Status Management
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <StatusActions
                tripId={trip.id}
                currentStatus={currentStatus}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>

            {/* Trip Summary */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Trip ID:</span>
                  <span className="font-mono text-blue-900">{trip.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Created:</span>
                  <span className="text-blue-900">{formatDate(trip.createdAt)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Last Updated:</span>
                  <span className="text-blue-900">{formatDate(trip.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}