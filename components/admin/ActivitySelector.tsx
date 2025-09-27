// components/admin/ActivitySelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/db/schema";

interface ActivitySelectorProps {
  tripId: string;
  destination: string;
  currentActivities: Activity[];
  onActivitiesUpdated: (activities: Activity[]) => void;
}

export default function ActivitySelector({ 
  tripId, 
  destination, 
  currentActivities,
  onActivitiesUpdated 
}: ActivitySelectorProps) {
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const destinationId = destination.toLowerCase().replace(/[^a-z0-9]/g, '');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableActivities();
    }
  }, [isOpen, destinationId]);

  const fetchAvailableActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/activities?destinationId=${destinationId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (activity: Activity) => {
    try {
      const response = await fetch(`/api/trip-requests/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.id })
      });

      if (response.ok) {
        const updatedActivities = [...currentActivities, activity];
        onActivitiesUpdated(updatedActivities);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const removeActivity = async (activity: Activity) => {
    try {
      const response = await fetch(`/api/trip-requests/${tripId}/activities`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.id })
      });

      if (response.ok) {
        const updatedActivities = currentActivities.filter(a => a.id !== activity.id);
        onActivitiesUpdated(updatedActivities);
      }
    } catch (error) {
      console.error('Error removing activity:', error);
    }
  };

  const currentActivityIds = currentActivities.map(a => a.id);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
      >
        {isOpen ? 'Hide' : 'Manage'} Activities
      </button>

      {isOpen && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Available Activities in {destination}
          </h4>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Loading activities...</p>
            </div>
          ) : availableActivities.length > 0 ? (
            <div className="space-y-2">
              {availableActivities.map((activity) => {
                const isSelected = currentActivityIds.includes(activity.id);
                return (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                      <p className="text-xs text-gray-500">
                        {activity.currency} {activity.price}
                      </p>
                    </div>
                    <button
                      onClick={() => isSelected ? removeActivity(activity) : addActivity(activity)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        isSelected
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">
              No activities found for this destination
            </p>
          )}
        </div>
      )}
    </div>
  );
}