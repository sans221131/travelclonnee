import {
  date,
  integer,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";

export const tripStatus = pgEnum("trip_status", [
  "new",
  "contacted",
  "quoted",
  "closed",
  "archived",
]);

export const tripRequests = pgTable("trip_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  origin: varchar("origin", { length: 160 }).notNull(),
  destination: varchar("destination", { length: 160 }).notNull(),
  nationality: varchar("nationality", { length: 120 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  adults: integer("adults").default(1).notNull(),
  kids: integer("kids").default(0).notNull(),
  airlinePreference: varchar("airline_preference", { length: 120 }).notNull(),
  hotelPreference: varchar("hotel_preference", { length: 120 }).notNull(),
  flightClass: varchar("flight_class", { length: 60 }).notNull(),
  visaStatus: varchar("visa_status", { length: 60 }).notNull(),
  passengerName: varchar("passenger_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneCountryCode: varchar("phone_country_code", { length: 8 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
  status: tripStatus("status").default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TripRequest = typeof tripRequests.$inferSelect;
export type NewTripRequest = typeof tripRequests.$inferInsert;
export type TripStatus = (typeof tripStatus.enumValues)[number];

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    destinationId: varchar("destination_id", { length: 64 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      destinationIdx: index("activities_destination_idx").on(
        table.destinationId
      ),
      uniquePerCity: uniqueIndex("activities_destination_name_unique").on(
        table.destinationId,
        table.name
      ),
    };
  }
);

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export const tripRequestActivities = pgTable(
  "trip_request_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripRequestId: uuid("trip_request_id")
      .notNull()
      .references(() => tripRequests.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tripIdx: index("tra_trip_idx").on(table.tripRequestId),
    activityIdx: index("tra_activity_idx").on(table.activityId),
    uniquePerTrip: uniqueIndex("tra_trip_activity_unique").on(
      table.tripRequestId,
      table.activityId
    ),
  })
);

export type TripRequestActivity = typeof tripRequestActivities.$inferSelect;
export type NewTripRequestActivity = typeof tripRequestActivities.$inferInsert;