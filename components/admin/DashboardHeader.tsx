// components/admin/DashboardHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  totalLeads?: number;
  leadsWithActivities?: number;
}

export default function DashboardHeader({ totalLeads, leadsWithActivities }: DashboardHeaderProps = {}) {
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
    <div className="bg-zinc-950 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage trip requests and monitor activities{lastUpdated && ` • Last updated: ${lastUpdated}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-white/10 hover:bg-white/20 text-zinc-300 border border-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              title="Refresh data"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              title="Logout"
            >
              {isLoggingOut ? "Loading..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}