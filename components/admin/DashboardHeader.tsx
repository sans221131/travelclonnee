// components/admin/DashboardHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  totalLeads: number;
  leadsWithActivities: number;
}

export default function DashboardHeader({ totalLeads, leadsWithActivities }: DashboardHeaderProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage trip requests and monitor activities{lastUpdated && ` • Last updated: ${lastUpdated}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalLeads} Total Leads
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {leadsWithActivities} With Activities
            </div>
            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              title="Refresh data"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              title="Logout"
            >
              {isLoggingOut ? "⏳" : "🚪"} Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}