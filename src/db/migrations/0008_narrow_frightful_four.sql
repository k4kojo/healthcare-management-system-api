ALTER TABLE "doctor_availability" ALTER COLUMN "day_of_week" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "start_time" SET DATA TYPE varchar(5);--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "end_time" SET DATA TYPE varchar(5);--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "available_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "available_to" timestamp with time zone;