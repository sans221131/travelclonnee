CREATE TYPE "public"."trip_status" AS ENUM('new', 'contacted', 'quoted', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" varchar(64) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_request_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_request_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" varchar(160) NOT NULL,
	"destination" varchar(160) NOT NULL,
	"nationality" varchar(120) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"kids" integer DEFAULT 0 NOT NULL,
	"airline_preference" varchar(120) NOT NULL,
	"hotel_preference" varchar(120) NOT NULL,
	"flight_class" varchar(60) NOT NULL,
	"visa_status" varchar(60) NOT NULL,
	"passenger_name" varchar(180) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_country_code" varchar(8) NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"status" "trip_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_request_activities" ADD CONSTRAINT "trip_request_activities_trip_request_id_trip_requests_id_fk" FOREIGN KEY ("trip_request_id") REFERENCES "public"."trip_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_request_activities" ADD CONSTRAINT "trip_request_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_destination_idx" ON "activities" USING btree ("destination_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activities_destination_name_unique" ON "activities" USING btree ("destination_id","name");--> statement-breakpoint
CREATE INDEX "tra_trip_idx" ON "trip_request_activities" USING btree ("trip_request_id");--> statement-breakpoint
CREATE INDEX "tra_activity_idx" ON "trip_request_activities" USING btree ("activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tra_trip_activity_unique" ON "trip_request_activities" USING btree ("trip_request_id","activity_id");