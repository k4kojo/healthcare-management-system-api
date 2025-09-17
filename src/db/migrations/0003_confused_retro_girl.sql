ALTER TABLE "prescriptions" ALTER COLUMN "appointment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "report_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "status" varchar(20) DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "file_size" varchar(20) DEFAULT null;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "file_name" varchar(255) DEFAULT null;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_report_id_unique" UNIQUE("report_id");