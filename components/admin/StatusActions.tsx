// components/admin/StatusActions.tsx
"use client";

import { useState } from "react";
import { TripStatus } from "@/db/schema";

interface StatusActionsProps {
  tripId: string;
  currentStatus: TripStatus;
  onStatusUpdate: (newStatus: TripStatus) => void;
}

const statusConfig: Record<TripStatus, { label: string; color: string }> = {
  new: { label: "New Lead", color: "blue" },
  contacted: { label: "Contacted", color: "yellow" },
  quoted: { label: "Quoted", color: "purple" },
  closed: { label: "Deal Closed", color: "green" },
  archived: { label: "Archived", color: "gray" },
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
          ${currentStatus === 'new' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
            currentStatus === 'contacted' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
            currentStatus === 'quoted' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
            currentStatus === 'closed' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
            'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'}`}>
          {statusConfig[currentStatus].label}
        </span>
      </div>

      {/* All Status Options */}
      <div className="space-y-2 border-t border-white/10 pt-3">
        <p className="text-xs text-zinc-500 text-center">Status Options:</p>
        <div className="grid grid-cols-2 gap-2">
          {allStatuses
            .filter(status => status !== currentStatus)
            .map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={isUpdating}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors disabled:opacity-50 border
                  ${status === 'new' ? 'bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 border-blue-500/20' :
                    status === 'contacted' ? 'bg-yellow-500/5 text-yellow-300 hover:bg-yellow-500/10 border-yellow-500/20' :
                    status === 'quoted' ? 'bg-purple-500/5 text-purple-300 hover:bg-purple-500/10 border-purple-500/20' :
                    status === 'closed' ? 'bg-green-500/5 text-green-300 hover:bg-green-500/10 border-green-500/20' :
                    'bg-zinc-500/5 text-zinc-300 hover:bg-zinc-500/10 border-zinc-500/20'}`}
              >
                {statusConfig[status as TripStatus].label}
              </button>
            ))}
        </div>
      </div>

      {isUpdating && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-zinc-500">
            <div className="w-3 h-3 border border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Updating status...</span>
          </div>
        </div>
      )}
    </div>
  );
}