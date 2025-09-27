// components/admin/DashboardStats.tsx
"use client";

import { TripRequest, Activity } from "@/db/schema";

type TripWithActivities = TripRequest & {
  activities: Activity[];
};

type DashboardStatsProps = {
  trips: TripWithActivities[];
};

export default function DashboardStats({ trips }: DashboardStatsProps) {
  const stats = {
    total: trips.length,
    new: trips.filter(t => t.status === "new").length,
    contacted: trips.filter(t => t.status === "contacted").length,
    quoted: trips.filter(t => t.status === "quoted").length,
    closed: trips.filter(t => t.status === "closed").length,
    withActivities: trips.filter(t => t.activities.length > 0).length,
  };

  const totalActivities = trips.reduce((sum, trip) => sum + trip.activities.length, 0);
  
  const totalRevenue = trips
    .filter(t => t.status === "closed")
    .reduce((sum, trip) => {
      return sum + trip.activities.reduce((actSum, activity) => {
        return actSum + parseFloat(activity.price);
      }, 0);
    }, 0);

  const avgActivitiesPerTrip = stats.total > 0 ? (totalActivities / stats.total).toFixed(1) : "0";

  const statCards = [
    {
      title: "New Inquiries",
      value: stats.new,
      color: "bg-green-500/20",
      bgColor: "bg-green-500/10",
      textColor: "text-green-300",
      borderColor: "border-green-500/20",
    },
    {
      title: "In Progress",
      value: stats.contacted + stats.quoted,
      color: "bg-yellow-500/20",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-300",
      borderColor: "border-yellow-500/20",
    },
    {
      title: "Closed Deals",
      value: stats.closed,
      color: "bg-purple-500/20",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-300",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border ${stat.borderColor} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group`}>
            <div className="space-y-4">
              <div className={`${stat.color} rounded-xl w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="w-6 h-6 border-2 border-current rounded opacity-70 group-hover:opacity-90 transition-opacity relative z-10"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{stat.title}</p>
                <p className={`text-4xl font-bold tracking-tight ${stat.textColor} group-hover:brightness-110 transition-all`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card (if there are closed deals) */}
      {totalRevenue > 0 && (
        <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 rounded-xl p-3 w-14 h-14 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-green-400"></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-300">Total Revenue from Closed Deals</h3>
                <p className="text-sm text-green-400 mt-1">Activities revenue from completed bookings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-300">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-400 mt-1">USD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}