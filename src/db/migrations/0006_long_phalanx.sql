ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patient_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "available_from" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "available_to" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "day_of_week" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "doctor_availability" ALTER COLUMN "day_of_week" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "start_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "end_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "is_available" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "max_patients" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "prescriptions" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "prescriptions" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "prescriptions" DROP COLUMN "diagnosis";