"use client";

import { useState, useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { Edit3, Check, AlertCircle, Search } from "lucide-react";

type Activity = {
  id: string;
  destinationId: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  reviewCount: number;
  imageUrl: string;
  isActive: boolean;
};

const currencies = ["USD", "EUR", "GBP", "INR", "AED", "CHF"];

export default function UpdateActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch all activities on mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/activities");
      const data = await response.json();
      if (response.ok) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setMessage(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!selectedActivity) return;
    const { name, value, type } = e.target;

    setSelectedActivity((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedActivity,
          price: parseFloat(selectedActivity.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Activity "${selectedActivity.name}" updated successfully!`,
        });
        // Refresh activities list
        fetchActivities();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update activity",
        });
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.destinationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Edit3 className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Update Activity</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Select an activity to edit its details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities List */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
              <div className="mb-4">
                <label htmlFor="search" className="sr-only">
                  Search activities
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {isFetching ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Loading activities...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredActivities.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">
                      No activities found
                    </p>
                  ) : (
                    filteredActivities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => handleSelectActivity(activity)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedActivity?.id === activity.id
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-zinc-800 border-white/10 hover:bg-zinc-800/80"
                        }`}
                      >
                        <p className="text-sm font-medium text-white truncate">
                          {activity.name}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 capitalize">
                          {activity.destinationId.replace(/-/g, " ")} •{" "}
                          {activity.currency} {activity.price}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            {!selectedActivity ? (
              <div className="bg-zinc-900 border border-white/10 rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Edit3 className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-200 mb-2">
                  No Activity Selected
                </h3>
                <p className="text-zinc-500 text-sm">
                  Select an activity from the list to edit its details
                </p>
              </div>
            ) : (
              <>
                {/* Message Alert */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg border ${
                      message.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {message.type === "success" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">{message.text}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                    {/* Activity Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Activity Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        maxLength={200}
                        value={selectedActivity.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        rows={4}
                        value={selectedActivity.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Price and Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium text-zinc-200 mb-2"
                        >
                          Price *
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          required
                          min="0"
                          step="0.01"
                          value={selectedActivity.price}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="currency"
                          className="block text-sm font-medium text-zinc-200 mb-2"
                        >
                          Currency *
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          required
                          value={selectedActivity.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {currencies.map((curr) => (
                            <option key={curr} value={curr}>
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Review Count */}
                    <div>
                      <label
                        htmlFor="reviewCount"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Review Count
                      </label>
                      <input
                        type="number"
                        id="reviewCount"
                        name="reviewCount"
                        min="0"
                        value={selectedActivity.reviewCount}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label
                        htmlFor="imageUrl"
                        className="block text-sm font-medium text-zinc-200 mb-2"
                      >
                        Image URL *
                      </label>
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        required
                        maxLength={500}
                        value={selectedActivity.imageUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={selectedActivity.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-white/10 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm text-zinc-200"
                      >
                        Activity is active and visible to users
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedActivity(null)}
                        className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
