"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";

type Props = {
  tripRequestId: string;
  activityId: string;
  activityName: string;
  activityImageUrl?: string;
  destinationId: string;
  price?: number;
  currency?: string;
  className?: string;
};

export default function AddToTripButton({ 
  tripRequestId, 
  activityId, 
  activityName,
  activityImageUrl,
  destinationId,
  price,
  currency,
  className 
}: Props) {
  const { addActivity, isActivityInCart } = useCart();
  const [status, setStatus] = React.useState<"idle" | "adding" | "added">("idle");

  const inCart = isActivityInCart(activityId);

  async function handleClick() {
    if (status === "adding" || inCart) return;
    
    setStatus("adding");
    
    // Add to cart
    addActivity({
      id: activityId,
      name: activityName,
      imageUrl: activityImageUrl,
      destinationId,
      price,
      currency,
      tripRequestId,
    });
    
    setStatus("added");
    setTimeout(() => setStatus("idle"), 2000);
  }

  const label =
    status === "adding" ? "Adding..." :
    status === "added" ? "Added to cart" :
    inCart ? "In cart" : "Add to cart";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "adding" || inCart}
      className={
        className ??
        `rounded-full border border-white/15 px-3 py-1.5 text-xs text-white transition-all disabled:opacity-60 ${
          inCart 
            ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-300" 
            : "bg-white/10 hover:bg-white/20"
        }`
      }
      aria-live="polite"
    >
      {label}
    </button>
  );
}
