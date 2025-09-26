// components/admin/AdminDashboard.tsx
"use client";

import { useState, useMemo } from "react";
import { TripRequest, Activity, TripStatus } from "@/db/schema";
import TripCard from "./TripCard";
import DashboardStats from "./DashboardStats";
import DashboardFilters from "./DashboardFilters";

type TripWithActivities = TripRequest & {
  activities: Activity[];
};

type AdminDashboardProps = {
  trips: TripWithActivities[];
};

export default function AdminDashboard({ trips }: AdminDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tripsData, setTripsData] = useState(trips);

  const handleStatusUpdate = (tripId: string, newStatus: TripStatus) => {
    setTripsData(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, status: newStatus, updatedAt: new Date() }
        : trip
    ));
  };

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = tripsData;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Destination filter
    if (destinationFilter !== "all") {
      filtered = filtered.filter(trip => 
        trip.destination.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.origin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name":
        filtered.sort((a, b) => a.passengerName.localeCompare(b.passengerName));
        break;
      case "destination":
        filtered.sort((a, b) => a.destination.localeCompare(b.destination));
        break;
      default:
        break;
    }

    return filtered;
  }, [tripsData, statusFilter, destinationFilter, sortBy, searchQuery]);

  const uniqueDestinations = useMemo(() => {
    const destinations = tripsData.map(trip => trip.destination);
    return [...new Set(destinations)].sort();
  }, [tripsData]);

  if (tripsData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trip requests yet</h3>
          <p className="text-gray-500">Trip requests will appear here when customers submit inquiries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Stats */}
      <DashboardStats trips={tripsData} />

      {/* Filters and Controls */}
      <DashboardFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        destinationFilter={destinationFilter}
        setDestinationFilter={setDestinationFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        uniqueDestinations={uniqueDestinations}
      />

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedTrips.length} of {tripsData.length} trip requests
        </p>
      </div>

      {/* Trip Cards Grid */}
      {filteredAndSortedTrips.length > 0 ? (
        <div className="grid gap-6 md:gap-8">
          {filteredAndSortedTrips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={index}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}