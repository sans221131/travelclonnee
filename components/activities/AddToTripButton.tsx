"use client";

import React from "react";

type Props = {
  tripRequestId: string;
  activityId: string;
  className?: string;
};

export default function AddToTripButton({ tripRequestId, activityId, className }: Props) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "added" | "exists" | "error">("idle");

  async function handleClick() {
    if (status === "loading" || status === "added" || status === "exists") return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/trip-requests/${tripRequestId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      });

      if (res.status === 201) {
        setStatus("added");
        return;
      }
      if (res.status === 409) {
        setStatus("exists");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "loading" ? "Adding..." :
    status === "added" ? "Added" :
    status === "exists" ? "Already in trip" :
    status === "error" ? "Retry" : "Add to trip";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading" || status === "added" || status === "exists"}
      className={
        className ??
        "rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 disabled:opacity-60"
      }
      aria-live="polite"
    >
      {label}
    </button>
  );
}
