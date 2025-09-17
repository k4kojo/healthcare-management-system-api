ALTER TABLE "reports" DROP CONSTRAINT "reports_report_id_unique";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "report_id";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "file_size";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "file_name";