CREATE TABLE "patient_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"national_id" varchar(100) DEFAULT null,
	"username" varchar(100) DEFAULT null,
	"gender" varchar(20) DEFAULT null,
	"date_of_birth" varchar(30) DEFAULT null,
	"phone_number" varchar(50) DEFAULT null,
	"email" varchar(255) DEFAULT null,
	"city" varchar(120) DEFAULT null,
	"province" varchar(120) DEFAULT null,
	"address" text DEFAULT null,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"created_by" uuid NOT NULL,
	"file_size" varchar(20) DEFAULT null,
	"file_name" varchar(255) DEFAULT null,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "profile_picture" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture_type" varchar(50) DEFAULT null;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_provider_ref_unique" UNIQUE("provider_ref");