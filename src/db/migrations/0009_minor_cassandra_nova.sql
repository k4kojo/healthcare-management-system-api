ALTER TABLE "doctor_availability" ALTER COLUMN "day_of_week" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "start_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "end_time" DROP NOT NULL;