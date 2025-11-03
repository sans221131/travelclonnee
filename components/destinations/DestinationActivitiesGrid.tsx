"use client";

import Image from "next/image";
import Link from "next/link";
import AddToTripButton from "@/components/activities/AddToTripButton";

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
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  activities: Activity[];
  destinationTitle: string;
};

function priceLabel(price: unknown, currency?: string | null) {
  if (price == null) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : (price as number);
  if (!isFinite(num)) return "Price on request";
  const cur = currency ?? "";
  const val = Intl.NumberFormat("en-IN").format(num);
  return `${cur} ${val}`.trim();
}

export default function DestinationActivitiesGrid({ activities, destinationTitle }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            {activity.imageUrl ? (
              <Image
                src={activity.imageUrl}
                alt={activity.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800/60 text-zinc-400">
                No image
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white ring-1 ring-white/20">
              {destinationTitle}
            </span>
          </div>

          <div className="p-4">
            <h3 className="line-clamp-2 text-sm font-medium text-white">
              {activity.name}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              {typeof activity.reviewCount === "number" && activity.reviewCount > 0 ? (
                <span>★ {activity.reviewCount} reviews</span>
              ) : (
                <span>New</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-white">
                {activity.price != null ? (
                  <span className="text-xs text-zinc-400 mr-1">from</span>
                ) : null}
                {priceLabel(activity.price, activity.currency)}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/activities/${activity.id}`}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  View
                </Link>
                <AddToTripButton
                  tripRequestId="destination-browse"
                  activityId={activity.id}
                  activityName={activity.name}
                  activityImageUrl={activity.imageUrl}
                  destinationId={activity.destinationId}
                  price={typeof activity.price === 'string' ? parseFloat(activity.price) : undefined}
                  currency={activity.currency}
                  className="rounded-full border border-blue-500/20 bg-blue-600/80 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
