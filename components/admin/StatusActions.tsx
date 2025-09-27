// components/admin/StatusActions.tsx
"use client";

import { useState } from "react";
import { TripStatus } from "@/db/schema";

interface StatusActionsProps {
  tripId: string;
  currentStatus: TripStatus;
  onStatusUpdate: (newStatus: TripStatus) => void;
}

const statusConfig: Record<TripStatus, { label: string; color: string; icon: string }> = {
  new: { label: "New Lead", color: "blue", icon: "🆕" },
  contacted: { label: "Contacted", color: "yellow", icon: "📞" },
  quoted: { label: "Quoted", color: "purple", icon: "💰" },
  closed: { label: "Deal Closed", color: "green", icon: "✅" },
  archived: { label: "Archived", color: "gray", icon: "📁" },
};

const statusFlow: Record<TripStatus, TripStatus[]> = {
  new: ["contacted", "archived"],
  contacted: ["quoted", "closed", "archived"],
  quoted: ["closed", "contacted", "archived"],
  closed: ["archived"],
  archived: ["new"],
};

export default function StatusActions({ tripId, currentStatus, onStatusUpdate }: StatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: TripStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/trip-requests/${tripId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onStatusUpdate(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const allStatuses = Object.keys(statusConfig) as TripStatus[];

  return (
    <div className="space-y-3">
      {/* Current Status */}
      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
          ${currentStatus === 'new' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            currentStatus === 'contacted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            currentStatus === 'quoted' ? 'bg-purple-100 text-purple-800 border-purple-200' :
            currentStatus === 'closed' ? 'bg-green-100 text-green-800 border-green-200' :
            'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {statusConfig[currentStatus].icon} {statusConfig[currentStatus].label}
        </span>
      </div>

      {/* All Status Options */}
      <div className="space-y-2 border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-500 text-center">Status Options:</p>
        <div className="grid grid-cols-2 gap-2">
          {allStatuses
            .filter(status => status !== currentStatus)
            .map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={isUpdating}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors disabled:opacity-50
                  ${status === 'new' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' :
                    status === 'contacted' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200' :
                    status === 'quoted' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200' :
                    status === 'closed' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' :
                    'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
              >
                {statusConfig[status as TripStatus].icon} {statusConfig[status as TripStatus].label}
              </button>
            ))}
        </div>
      </div>

      {isUpdating && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            <span>Updating status...</span>
          </div>
        </div>
      )}
    </div>
  );
}