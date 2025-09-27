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

  // Map destination names to destination IDs used in activities table
  const getDestinationId = (dest: string): string => {
    const destLower = dest.toLowerCase();
    if (destLower.includes('dubai')) return 'dubai';
    if (destLower.includes('bangkok') || destLower.includes('thailand')) return 'thailand';
    if (destLower.includes('london')) return 'london';
    if (destLower.includes('new york') || destLower.includes('united states')) return 'united-states';
    if (destLower.includes('bali')) return 'bali';
    if (destLower.includes('switzerland')) return 'switzerland';
    if (destLower.includes('paris')) return 'paris';
    if (destLower.includes('bhutan')) return 'bhutan';
    if (destLower.includes('maldives')) return 'maldives';
    if (destLower.includes('kerala')) return 'kerala';
    if (destLower.includes('assam')) return 'assam';
    if (destLower.includes('himachal')) return 'himachal';
    if (destLower.includes('meghalaya')) return 'meghalaya';
    if (destLower.includes('mysore')) return 'mysore';
    if (destLower.includes('rajasthan')) return 'rajasthan';
    if (destLower.includes('uttarakhand')) return 'uttarakhand';
    if (destLower.includes('ladakh')) return 'ladakh';
    
    // Fallback: clean the destination string
    return destLower.replace(/[^a-z0-9]/g, '');
  };

  const destinationId = getDestinationId(destination);

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
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-3 rounded-lg border border-blue-200 transition-colors"
      >
        {isOpen ? '👁️ Hide' : '⚙️ Manage'} Activities
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