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
      title: "Total Leads",
      value: stats.total,
      icon: "👥",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "New Inquiries",
      value: stats.new,
      icon: "🆕",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "In Progress",
      value: stats.contacted + stats.quoted,
      icon: "⏳",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Closed Deals",
      value: stats.closed,
      icon: "✅",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "With Activities",
      value: stats.withActivities,
      icon: "🎯",
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      title: "Avg Activities",
      value: avgActivitiesPerTrip,
      icon: "📊",
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-opacity-20`}>
            <div className="flex items-center space-x-3">
              <div className={`${stat.color} rounded-lg p-2 text-white text-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card (if there are closed deals) */}
      {totalRevenue > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 rounded-full p-3 text-white text-xl">
                💰
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Total Revenue from Closed Deals</h3>
                <p className="text-sm text-green-700">Activities revenue from completed bookings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-700">USD</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Conversion Rate</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.total > 0 ? (stats.closed / stats.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Activity Engagement</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.total > 0 ? (stats.withActivities / stats.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.total > 0 ? Math.round((stats.withActivities / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Pipeline Health</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats.total > 0 ? ((stats.contacted + stats.quoted) / stats.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.total > 0 ? Math.round(((stats.contacted + stats.quoted) / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}