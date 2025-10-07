"use client";

import { useState } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { PlusCircle, Check, AlertCircle } from "lucide-react";

const destinations = [
  { id: "dubai", name: "Dubai" },
  { id: "thailand", name: "Thailand" },
  { id: "london", name: "London" },
  { id: "united-states", name: "United States" },
  { id: "bali", name: "Bali" },
  { id: "switzerland", name: "Switzerland" },
  { id: "paris", name: "Paris" },
  { id: "bhutan", name: "Bhutan" },
  { id: "maldives", name: "Maldives" },
  { id: "kerala", name: "Kerala" },
  { id: "assam", name: "Assam" },
  { id: "himachal", name: "Himachal Pradesh" },
  { id: "meghalaya", name: "Meghalaya" },
  { id: "mysore", name: "Mysore" },
  { id: "rajasthan", name: "Rajasthan" },
  { id: "uttarakhand", name: "Uttarakhand" },
  { id: "ladakh", name: "Ladakh" },
];

const currencies = ["USD", "EUR", "GBP", "INR", "AED", "CHF"];

export default function AddActivityPage() {
  const [formData, setFormData] = useState({
    destinationId: "",
    name: "",
    description: "",
    price: "",
    currency: "USD",
    reviewCount: "0",
    imageUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          reviewCount: parseInt(formData.reviewCount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Activity "${formData.name}" created successfully!`,
        });
        // Reset form
        setFormData({
          destinationId: "",
          name: "",
          description: "",
          price: "",
          currency: "USD",
          reviewCount: "0",
          imageUrl: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to create activity",
        });
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <PlusCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Add New Activity</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Create a new activity for travelers to explore and book
          </p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            {/* Destination */}
            <div className="mb-6">
              <label
                htmlFor="destinationId"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Destination *
              </label>
              <select
                id="destinationId"
                name="destinationId"
                required
                value={formData.destinationId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a destination</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Name */}
            <div className="mb-6">
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
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Burj Khalifa Observation Deck"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
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
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the activity, what's included, highlights..."
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99.99"
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="mb-6">
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
                value={formData.reviewCount}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image URL */}
            <div className="mb-6">
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
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="/images/destination.jpg"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Use a path like /images/destination.jpg or full URL
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Activity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
