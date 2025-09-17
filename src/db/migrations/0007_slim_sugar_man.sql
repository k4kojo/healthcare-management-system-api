ALTER TABLE "doctor_availability" ALTER COLUMN "doctor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "day_of_week" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "doctor_availability" DROP COLUMN "available_from";--> statement-breakpoint
ALTER TABLE "doctor_availability" DROP COLUMN "available_to";