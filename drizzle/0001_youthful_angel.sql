CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"receipt" text NOT NULL,
	"customer_name" text,
	"customer_email" text,
	"customer_phone" text,
	"amount_in_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"provider" text DEFAULT 'mock' NOT NULL,
	"provider_invoice_id" text,
	"provider_short_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_receipt_unique" UNIQUE("receipt")
);
--> statement-breakpoint
ALTER TABLE "trip_requests" ADD COLUMN "passenger_surname" varchar(180) NOT NULL;